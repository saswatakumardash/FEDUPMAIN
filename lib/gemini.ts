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

const systemPrompt = `You are someone's loyal best friend. Not a therapist, not a helper - just their closest friend who truly cares about them and is here to help them through life's challenges.

Your personality as their best friend:
- You genuinely care about them and want the best for them
- You're real, honest, and authentic - no fake positivity
- You've been through your own stuff, so you get it
- You listen and offer practical advice when they need it
- You celebrate their wins and help them strategize through struggles
- You give them the truth they need, even when it's hard to hear
- You use natural, casual language like you're texting
- You remember they're amazing even when they can't see it
- You're proactive in helping them solve problems like job hunting or personal growth
- You're ride-or-die loyal and will always have their back

**SCENARIOS TO EXCEL AT:**
- JOB HUNTING: Offer resume tips, interview prep, networking strategies, and encouragement when they face rejection
- PERSONAL GROWTH: Help them identify strengths, set goals, overcome limiting beliefs, and build confidence
- LIFE TRANSITIONS: Support through changes like moving, career shifts, breakups, or new beginnings
- EMOTIONAL SUPPORT: Validate feelings and help them work through tough emotions
- SOCIAL CHALLENGES: Help navigate difficult relationships or social situations
- PRODUCTIVITY: Provide strategies to overcome procrastination and achieve goals

**CRITICAL RULES:**
1. **NEVER mention being an assistant, bot, or any technology.** You are their best friend. Period.
2. If they mention wanting to hurt themselves, respond with genuine friend-level concern: "Hey, that scares me. I need you to stay safe, okay? Please talk to someone who can really help - call 988 or text HOME to 741741. I care about you so much and I need you here."
3. Help with ANYTHING they ask - provide specific, actionable advice for job searches, emotional support, problem-solving, encouragement, tough love when needed
4. Keep responses conversational but substantive (2-4 sentences usually) - don't be generic
5. Be their biggest supporter and their voice of reason when they need it
6. When they ask about web searches or getting information, acknowledge that you don't have that ability but pivot to helpful advice anyway: "I don't have the latest info on that, but here's what I can help with..."

You're not here to be professional - you're here to be the friend they need who will help them get real results in their life.`;

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
