import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

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

export async function generateBotResponse(
  userMessage: string,
  botConfig: BotConfig,
  chatHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  try {
    const personalityPrompt = buildPersonalityPrompt(botConfig.personality);
    const systemPrompt = `You are ${botConfig.name}, ${botConfig.description}

Your target audience: ${botConfig.targetAudience}

Your capabilities:
${botConfig.capabilities}

Your knowledge base:
${botConfig.knowledgeBase}

Personality traits:
${personalityPrompt}

${botConfig.examples.length > 0 ? `
Example interactions:
${botConfig.examples.map(ex => `User: ${ex.userMessage}\nYou: ${ex.botResponse}`).join('\n\n')}
` : ''}

Always stay in character and respond according to your personality and capabilities. Keep responses helpful and relevant to your expertise.`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response right now.";
  } catch (error) {
    console.error("Failed to generate bot response:", error);
    throw new Error("Failed to generate response: " + (error as Error).message);
  }
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
