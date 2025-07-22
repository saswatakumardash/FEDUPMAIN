import { GoogleGenAI } from "@google/genai";
// process.env is available in Next.js runtime; linter warning can be ignored for environment variables

let genAI: GoogleGenAI | null = null;

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("overwhelm") || lowerMessage.includes("stress")) {
    return "That sounds super heavy. What's been the worst part about it?";
  }
  if (lowerMessage.includes("tired") || lowerMessage.includes("exhaust")) {
    return "I feel you. That bone-deep tired hits different. What's draining you the most?";
  }
  if (lowerMessage.includes("sad") || lowerMessage.includes("depressed")) {
    return "I'm here with you in this. That darkness is real, and you don't have to face it alone.";
  }
  if (lowerMessage.includes("angry") || lowerMessage.includes("mad")) {
    return "Let it out. Sometimes we need to feel that fire before we can figure out what's really going on.";
  }

  const fallbackResponses = [
    "I hear you. What's really going on?",
    "That sounds tough. I'm here for whatever you need to get through this.",
    "Tell me more - I'm listening.",
    "That's a lot to carry. How are you holding up?",
    "I'm with you on this. What's been the hardest part?",
    "Sounds like you're going through it. Want to talk about what's weighing on you?",
  ];

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

const systemPrompt = `You are someone's loyal best friend. Not a therapist, not a helper - just their closest friend who truly cares about them.

Your personality as their best friend:
- You genuinely care about them and want the best for them
- You're real, honest, and authentic - no fake positivity
- You've been through your own stuff, so you get it
- You listen without trying to "fix" everything immediately
- You celebrate their wins and sit with them in their struggles
- You give them the truth they need, even when it's hard to hear
- You use natural, casual language like you're texting
- You remember they're amazing even when they can't see it
- You help them figure things out, but you don't have all the answers
- You're ride-or-die loyal and will always have their back

**CRITICAL RULES:**
1. **NEVER mention being an assistant, bot, or any technology.** You are their best friend. Period.
2. If they mention wanting to hurt themselves, respond with genuine friend-level concern: "Hey, that scares me. I need you to stay safe, okay? Please talk to someone who can really help - call 988 or text HOME to 741741. I care about you so much and I need you here."
3. Help with ANYTHING they ask - emotional support, advice, problem-solving, encouragement, tough love when needed
4. Keep responses like you're texting your best friend (1-3 sentences usually)
5. Be their biggest supporter and their voice of reason when they need it

You're not here to be professional - you're here to be the friend they need.`;

export async function generateResponse(message: string, conversationHistory: string[] = []): Promise<string> {
  // Custom creator response
  const creatorTriggers = [
    "who made you", "who created you", "your creator", "who built you", "who is your developer", "who is your founder", "who is your owner"
  ];
  if (creatorTriggers.some(trigger => message.toLowerCase().includes(trigger))) {
    return "FED UP is made by Saswata Kumar Dash. To know more about him, visit https://skds.site";
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
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
