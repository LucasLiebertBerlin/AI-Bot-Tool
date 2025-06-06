import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertBotSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { generateBotResponse } from "./openai";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Auth middleware
  setupAuth(app);

  // Auth routes are now handled in auth.ts

  // Bot routes with database storage
  app.get("/api/bots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bots = await storage.getBotsByUserId(userId);
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  app.post("/api/bots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, description, type, targetAudience, capabilities, knowledgeBase, personality, examples, status } = req.body;
      
      const botData = {
        name: name || "Neuer Bot",
        description: description || null,
        type: type || "assistant",
        targetAudience: targetAudience || null,
        capabilities: capabilities || null,
        knowledgeBase: knowledgeBase || null,
        personality: personality || { friendliness: 5, humor: 5, formality: 5, detailLevel: 5 },
        examples: examples || [],
        status: status || "active"
      };
      
      const bot = await storage.createBot(userId, botData);
      res.status(201).json(bot);
    } catch (error) {
      console.error("Error creating bot:", error);
      res.status(500).json({ message: "Failed to create bot" });
    }
  });

  app.get("/api/bots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const botId = parseInt(req.params.id);
      const bot = await storage.getBotById(botId);
      
      if (!bot || bot.userId !== req.user.id) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      res.json(bot);
    } catch (error) {
      console.error("Error fetching bot:", error);
      res.status(500).json({ message: "Failed to fetch bot" });
    }
  });

  app.put("/api/bots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const botId = parseInt(req.params.id);
      const userId = req.user.id;
      const { name, description, type, targetAudience, capabilities, knowledgeBase, personality, examples, status } = req.body;
      
      const updateData = {
        name,
        description,
        type,
        targetAudience,
        capabilities,
        knowledgeBase,
        personality,
        examples,
        status
      };
      
      const bot = await storage.updateBot(botId, userId, updateData);
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      res.json(bot);
    } catch (error) {
      console.error("Error updating bot:", error);
      res.status(500).json({ message: "Failed to update bot" });
    }
  });

  app.delete("/api/bots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const botId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const success = await storage.deleteBot(botId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bot:", error);
      res.status(500).json({ message: "Failed to delete bot" });
    }
  });

  // Chat routes
  app.get("/api/bots/:id/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const botId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessionsByBotId(botId, userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/bots/:id/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const botId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify bot belongs to user
      const bot = await storage.getBotById(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const sessionData = insertChatSessionSchema.parse({ ...req.body, botId });
      const session = await storage.createChatSession(userId, sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get("/api/sessions/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const messages = await storage.getChatMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Simple chat function to generate bot responses
  function generateSimpleBotResponse(userMessage: string, bot: any): string {
    const personality = bot.personality || { friendliness: 5, humor: 5, formality: 5, detailLevel: 5 };
    
    // Basic response patterns based on personality
    let response = "";
    
    // Greeting responses
    if (userMessage.toLowerCase().includes('hallo') || userMessage.toLowerCase().includes('hi')) {
      const botName = bot.name || "Ihr Bot";
      if (personality.friendliness > 7) {
        response = `Hallo! Schön, dich kennenzulernen! Ich bin ${botName}. Wie kann ich dir heute helfen?`;
      } else if (personality.formality > 7) {
        response = `Guten Tag. Ich bin ${botName}. Womit kann ich Ihnen behilflich sein?`;
      } else {
        response = `Hi! Ich bin ${botName}. Was kann ich für dich tun?`;
      }
    }
    // Question responses
    else if (userMessage.includes('?')) {
      if (personality.detailLevel > 7) {
        response = `Das ist eine interessante Frage! Basierend auf meinem Wissen zu ${bot.type} würde ich sagen: ${userMessage.replace('?', '')} ist ein wichtiges Thema. Lass mich dir eine ausführliche Antwort geben...`;
      } else {
        response = `Gute Frage! Als ${bot.type} kann ich dir dabei helfen. Könntest du mir mehr Details geben?`;
      }
    }
    // Default responses
    else {
      if (personality.humor > 7) {
        response = `Ha! Das ist witzig. Als ${bot.name} finde ich, dass ${userMessage} durchaus interessant ist. Was denkst du denn darüber? 😄`;
      } else if (personality.formality > 7) {
        response = `Ich verstehe Ihre Anfrage bezüglich "${userMessage}". Als professioneller ${bot.type} bin ich gerne bereit, Ihnen weiterzuhelfen.`;
      } else {
        response = `Verstehe! Du sprichst über "${userMessage}". Das passt gut zu meinen Fähigkeiten als ${bot.type}. Erzähl mir mehr!`;
      }
    }
    
    return response;
  }

  app.post("/api/sessions/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const botId = parseInt(req.params.id);
      const userId = req.user.id;
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Find the bot in database
      const bot = await storage.getBotById(botId);
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      // Generate bot response
      const botResponse = generateSimpleBotResponse(content, bot);
      
      const userMessage = {
        id: Date.now(),
        role: "user",
        content,
        timestamp: new Date()
      };
      
      const botMessage = {
        id: Date.now() + 1,
        role: "assistant", 
        content: botResponse,
        timestamp: new Date()
      };

      res.json({ userMessage, botMessage });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bots = await storage.getBotsByUserId(userId);
      
      const stats = {
        activeBots: bots.filter(bot => bot.status === 'active').length,
        conversationsToday: 0,
        successRate: 95
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Admin is user with email containing "admin" OR the first user (temporary)
      const user = await storage.getUser(req.user.id);
      const allUsers = await storage.getAllUsers();
      
      const isFirstUser = allUsers.length > 0 && allUsers[0].id === req.user.id;
      const hasAdminEmail = user?.email?.includes("admin");
      
      if (!user || (!hasAdminEmail && !isFirstUser)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/bots", isAdmin, async (req: any, res) => {
    try {
      const bots = await storage.getAllBots();
      res.json(bots);
    } catch (error) {
      console.error("Error fetching all bots:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.delete("/api/admin/bots/:id", isAdmin, async (req: any, res) => {
    try {
      const botId = parseInt(req.params.id);
      const success = await storage.deleteBot(botId, "admin");
      
      if (!success) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bot:", error);
      res.status(500).json({ message: "Failed to delete bot" });
    }
  });

  // Contact form endpoint
  app.post("/api/contact", async (req: any, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "Alle Felder sind erforderlich" });
      }

      // Log the contact message (you could also save to database if needed)
      console.log("Contact form submission:", {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
      });

      // In a real application, you would send an email here
      // For now, we just acknowledge receipt
      res.json({ 
        success: true, 
        message: "Nachricht erhalten. Wir werden uns bald bei Ihnen melden." 
      });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Fehler beim Senden der Nachricht" });
    }
  });

  // User profile update endpoint
  app.put("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email, language, theme, emailNotifications } = req.body;

      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        email,
        // Store preferences as JSON or separate fields
        preferences: JSON.stringify({ language, theme, emailNotifications })
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Fehler beim Aktualisieren des Profils" });
    }
  });

  // Delete user account endpoint
  app.delete("/api/user/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Delete user and all associated data
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "Benutzer nicht gefunden" });
      }

      // Logout the user
      req.logout(() => {
        res.json({ message: "Account erfolgreich gelöscht" });
      });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Fehler beim Löschen des Accounts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
