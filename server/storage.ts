import {
  users,
  bots,
  chatSessions,
  chatMessages,
  type User,
  type UpsertUser,
  type Bot,
  type InsertBot,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Bot operations
  getBotsByUserId(userId: string): Promise<Bot[]>;
  getBotById(id: number): Promise<Bot | undefined>;
  createBot(userId: string, bot: InsertBot): Promise<Bot>;
  updateBot(id: number, userId: string, bot: Partial<InsertBot>): Promise<Bot | undefined>;
  deleteBot(id: number, userId: string): Promise<boolean>;
  
  // Chat operations
  getChatSessionsByBotId(botId: number, userId: string): Promise<ChatSession[]>;
  getChatSessionById(sessionId: number): Promise<ChatSession | undefined>;
  createChatSession(userId: string, session: InsertChatSession): Promise<ChatSession>;
  getChatMessagesBySessionId(sessionId: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Bot operations
  async getBotsByUserId(userId: string): Promise<Bot[]> {
    return await db
      .select()
      .from(bots)
      .where(eq(bots.userId, userId))
      .orderBy(desc(bots.createdAt));
  }

  async getBotById(id: number): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot || undefined;
  }

  async createBot(userId: string, bot: InsertBot): Promise<Bot> {
    const [newBot] = await db
      .insert(bots)
      .values({ ...bot, userId })
      .returning();
    return newBot;
  }

  async updateBot(id: number, userId: string, bot: Partial<InsertBot>): Promise<Bot | undefined> {
    const [updatedBot] = await db
      .update(bots)
      .set({ ...bot, updatedAt: new Date() })
      .where(and(eq(bots.id, id), eq(bots.userId, userId)))
      .returning();
    return updatedBot || undefined;
  }

  async deleteBot(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(bots)
      .where(and(eq(bots.id, id), eq(bots.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Chat operations
  async getChatSessionsByBotId(botId: number, userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(and(eq(chatSessions.botId, botId), eq(chatSessions.userId, userId)))
      .orderBy(desc(chatSessions.createdAt));
  }

  async getChatSessionById(sessionId: number): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId));
    return session || undefined;
  }

  async createChatSession(userId: string, session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db
      .insert(chatSessions)
      .values({ ...session, userId })
      .returning();
    return newSession;
  }

  async getChatMessagesBySessionId(sessionId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();