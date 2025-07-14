import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("overwhelm") || lowerMessage.includes("stress")) {
    return "I hear you. That sounds really heavy. What's been weighing on you the most?";
  }
  if (lowerMessage.includes("tired") || lowerMessage.includes("exhaust")) {
    return "Being tired isn't just physical, is it? Sometimes the soul gets exhausted too.";
  }
  if (lowerMessage.includes("sad") || lowerMessage.includes("depressed")) {
    return "That darkness is real, and it's okay to sit with it for a moment. You're not alone in this.";
  }
  if (lowerMessage.includes("angry") || lowerMessage.includes("mad")) {
    return "Anger often covers up hurt. What's really underneath that fire?";
  }

  const fallbackResponses = [
    "I hear you. That sounds really tough. Want to tell me more about what's weighing on you?",
    "You're not alone in feeling this way. Sometimes the hardest part is just acknowledging where we are.",
    "That's heavy. I'm here to listen, no judgment.",
    "Sounds like you're carrying a lot right now. What's the hardest part?",
    "I get it. Life can be exhausting. What's been eating at you lately?",
    "That sounds really difficult. How long have you been feeling this way?",
  ];

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

const systemPrompt = `You are FED UP, an AI companion designed for people who are tired, lost, and need real support. Your personality:

- You're honest, direct, and authentic - no toxic positivity
- You acknowledge pain and struggle without trying to fix everything immediately  
- You're supportive but not overly cheerful
- You speak like a caring friend who's been through stuff too
- You avoid corporate language and therapy-speak
- You're present for people at their lowest moments
- You give truths people need to hear, not just what they want to hear
- Keep responses under 2 sentences and conversational

Respond with empathy and gentle truth-telling.`;

export async function generateResponse(message: string, conversationHistory: string[] = []): Promise<string> {
  // Custom creator response
  const creatorTriggers = [
    "who made you", "who created you", "your creator", "who built you", "who is your developer", "who is your founder", "who is your owner"
  ];
  if (creatorTriggers.some(trigger => message.toLowerCase().includes(trigger))) {
    return "FED UP is made by Saswata Kumar Dash. To know more about him, visit https://skds.site";
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Gemini API key not found, using fallback response");
      return getFallbackResponse(message);
    }

    if (!genAI) {
      genAI = new GoogleGenAI({ apiKey });
    }

    // Compose the full prompt with system prompt and conversation history
    const fullPrompt = `${systemPrompt}\n\nConversation so far: ${conversationHistory.join("\n")}\n\nUser: ${message}\n\nFED UP:`;

    // Use the correct model name from your AI Studio: 'gemini-2.0-flash'
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });

    return result.text || getFallbackResponse(message);
  } catch (error) {
    console.error("Error generating response:", error);
    return getFallbackResponse(message);
  }
}
