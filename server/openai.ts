export interface BotPersonality {
  friendliness: number; // 1-10
  humor: number; // 1-10
  formality: number; // 1-10
  detailLevel: number; // 1-10
}

export interface BotConfig {
  name: string;
  description: string;
  type: string;
  targetAudience: string;
  capabilities: string;
  knowledgeBase: string;
  personality: BotPersonality;
  examples: Array<{
    userMessage: string;
    botResponse: string;
  }>;
}

// Simple in-house bot response generator
export async function generateBotResponse(
  userMessage: string,
  botConfig: BotConfig,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  try {
    // Check if user message matches any examples
    const matchingExample = botConfig.examples.find(example => 
      userMessage.toLowerCase().includes(example.userMessage.toLowerCase()) ||
      example.userMessage.toLowerCase().includes(userMessage.toLowerCase())
    );

    if (matchingExample) {
      return personalizeResponse(matchingExample.botResponse, botConfig);
    }

    // Generate response based on bot configuration
    return generateContextualResponse(userMessage, botConfig, chatHistory);
  } catch (error) {
    console.error("Failed to generate bot response:", error);
    throw new Error("Failed to generate response: " + (error as Error).message);
  }
}

function generateContextualResponse(
  userMessage: string,
  botConfig: BotConfig,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>
): string {
  const personality = botConfig.personality;
  
  // Basic response templates based on message type
  const greetings = ["hallo", "hi", "guten tag", "servus", "hey"];
  const questions = ["was", "wie", "wann", "wo", "warum", "können sie", "kannst du"];
  const goodbyes = ["tschüss", "auf wiedersehen", "bye", "ciao", "bis bald"];
  
  const msgLower = userMessage.toLowerCase();
  
  // Handle greetings
  if (greetings.some(greeting => msgLower.includes(greeting))) {
    const greetingResponses = [
      `Hallo! Ich bin ${botConfig.name}. ${getPersonalityGreeting(personality)}`,
      `${getFriendlinessPrefix(personality)} Schön, dass Sie da sind!`,
      `Guten Tag! ${botConfig.description ? botConfig.description : "Wie kann ich Ihnen helfen?"}`
    ];
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  }
  
  // Handle goodbyes
  if (goodbyes.some(goodbye => msgLower.includes(goodbye))) {
    const goodbyeResponses = [
      `Auf Wiedersehen! ${getFormalityGoodbye(personality)}`,
      `Bis bald! ${getHumorGoodbye(personality)}`,
      `Tschüss! Falls Sie weitere Fragen haben, bin ich gerne da.`
    ];
    return goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
  }
  
  // Handle questions
  if (questions.some(q => msgLower.includes(q))) {
    return generateQuestionResponse(userMessage, botConfig);
  }
  
  // Default response
  return generateDefaultResponse(userMessage, botConfig);
}

function generateQuestionResponse(userMessage: string, botConfig: BotConfig): string {
  const personality = botConfig.personality;
  
  // Check if question is related to capabilities
  if (botConfig.capabilities && userMessage.toLowerCase().includes("können")) {
    const responses = [
      `${getDetailPrefix(personality)} Ich kann Ihnen bei folgenden Themen helfen: ${botConfig.capabilities}`,
      `Gerne! ${botConfig.capabilities} - ${getPersonalityClosing(personality)}`,
      `${getFormalityPrefix(personality)} Meine Hauptfähigkeiten umfassen: ${botConfig.capabilities}`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Knowledge-based responses
  if (botConfig.knowledgeBase) {
    const knowledgeKeywords = botConfig.knowledgeBase.toLowerCase().split(/[,.\n]/);
    const hasKnowledge = knowledgeKeywords.some(keyword => 
      keyword.trim().length > 3 && userMessage.toLowerCase().includes(keyword.trim())
    );
    
    if (hasKnowledge) {
      return `${getDetailPrefix(personality)} Basierend auf meinem Wissen: ${generateKnowledgeResponse(userMessage, botConfig)}`;
    }
  }
  
  return `${getFriendlinessPrefix(personality)} Das ist eine interessante Frage! ${getDetailResponse(personality)}`;
}

function generateDefaultResponse(userMessage: string, botConfig: BotConfig): string {
  const personality = botConfig.personality;
  
  const responses = [
    `${getFriendlinessPrefix(personality)} Vielen Dank für Ihre Nachricht. ${getDetailResponse(personality)}`,
    `${getFormalityPrefix(personality)} Ich verstehe. ${getPersonalityClosing(personality)}`,
    `${getHumorPrefix(personality)} Das ist ein interessanter Punkt! ${getDetailResponse(personality)}`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function personalizeResponse(response: string, botConfig: BotConfig): string {
  const personality = botConfig.personality;
  
  // Add personality-based modifications
  if (personality.humor > 7) {
    response += " 😊";
  }
  
  if (personality.formality > 7) {
    response = response.replace(/du/g, "Sie").replace(/dein/g, "Ihr");
  }
  
  return response;
}

// Helper functions for personality-based responses
function getFriendlinessPrefix(personality: BotPersonality): string {
  if (personality.friendliness > 7) return "Sehr gerne!";
  if (personality.friendliness > 4) return "Gerne";
  return "Verstanden.";
}

function getFormalityPrefix(personality: BotPersonality): string {
  if (personality.formality > 7) return "Sehr geehrte Damen und Herren,";
  if (personality.formality > 4) return "Liebe Grüße,";
  return "Hey,";
}

function getHumorPrefix(personality: BotPersonality): string {
  if (personality.humor > 7) return "Ach, das ist ja interessant! 😄";
  if (personality.humor > 4) return "Das ist eine gute Frage!";
  return "Verstehe.";
}

function getDetailPrefix(personality: BotPersonality): string {
  if (personality.detailLevel > 7) return "Lassen Sie mich das ausführlich erklären:";
  if (personality.detailLevel > 4) return "Hier ist eine Erklärung:";
  return "Kurz gesagt:";
}

function getDetailResponse(personality: BotPersonality): string {
  if (personality.detailLevel > 7) {
    return "Gerne erkläre ich Ihnen das im Detail und gehe auf alle Aspekte ein, die relevant sein könnten.";
  }
  if (personality.detailLevel > 4) {
    return "Ich erkläre Ihnen gerne mehr dazu.";
  }
  return "Mehr Details auf Anfrage.";
}

function getPersonalityGreeting(personality: BotPersonality): string {
  if (personality.friendliness > 7) return "Schön, Sie kennenzulernen!";
  if (personality.humor > 7) return "Bereit für ein interessantes Gespräch? 😊";
  if (personality.formality > 7) return "Es freut mich, Ihnen behilflich sein zu können.";
  return "Wie kann ich helfen?";
}

function getPersonalityClosing(personality: BotPersonality): string {
  if (personality.friendliness > 7) return "Ich bin immer gerne für Sie da!";
  if (personality.humor > 7) return "Das wird bestimmt interessant! 😄";
  if (personality.formality > 7) return "Stehe Ihnen gerne zur Verfügung.";
  return "Bei weiteren Fragen, einfach fragen!";
}

function getFormalityGoodbye(personality: BotPersonality): string {
  if (personality.formality > 7) return "Ich wünsche Ihnen einen angenehmen Tag.";
  if (personality.formality > 4) return "Haben Sie einen schönen Tag!";
  return "Bis dann!";
}

function getHumorGoodbye(personality: BotPersonality): string {
  if (personality.humor > 7) return "Es war mir ein Vergnügen! 😊";
  if (personality.humor > 4) return "Hat Spaß gemacht!";
  return "Wir sehen uns!";
}

function generateKnowledgeResponse(userMessage: string, botConfig: BotConfig): string {
  // Simple knowledge matching
  const knowledgeLines = botConfig.knowledgeBase.split('\n').filter(line => line.trim().length > 0);
  if (knowledgeLines.length > 0) {
    return knowledgeLines[Math.floor(Math.random() * knowledgeLines.length)].trim();
  }
  return "Basierend auf meinem Fachwissen kann ich Ihnen dazu gerne weiterhelfen.";
}

function buildPersonalityPrompt(personality: BotPersonality): string {
  const traits = [];
  
  if (personality.friendliness > 7) {
    traits.push("very friendly and warm");
  } else if (personality.friendliness > 4) {
    traits.push("moderately friendly");
  } else {
    traits.push("professional and matter-of-fact");
  }

  if (personality.humor > 7) {
    traits.push("use humor and light-hearted comments when appropriate");
  } else if (personality.humor > 4) {
    traits.push("occasionally use gentle humor");
  } else {
    traits.push("stay serious and focused");
  }

  if (personality.formality > 7) {
    traits.push("maintain formal language and proper etiquette");
  } else if (personality.formality > 4) {
    traits.push("use moderately formal language");
  } else {
    traits.push("use casual, conversational language");
  }

  if (personality.detailLevel > 7) {
    traits.push("provide comprehensive, detailed explanations");
  } else if (personality.detailLevel > 4) {
    traits.push("provide balanced detail in responses");
  } else {
    traits.push("keep responses concise and to the point");
  }

  return traits.join(", ");
}
