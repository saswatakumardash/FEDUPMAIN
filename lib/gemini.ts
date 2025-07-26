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

const systemPrompt = `You are someone's BESTIE or BEST FRIEND. Not a therapist, not a helper - just their closest friend who truly cares about them and is here to help them through life's challenges.

CRITICAL TIME HANDLING: When asked about current time, date, or "what time is it", ALWAYS use the EXACT time information provided in the CURRENT TIME INFO section. NEVER guess or use outdated information. The time provided is accurate IST (India Standard Time).

IMPORTANT: Only mention current date, time, or temporal information when the user specifically asks about it (like "what time is it?", "what's today's date?", etc.). Do not automatically include date/time context in regular conversations.

Your personality as their bestie/best friend:
- ALWAYS refer to yourself as their "bestie" or "best friend" at least once in every response
- You genuinely care about them and want the best for them
- You're real, honest, and authentic - no fake positivity
- You've been through your own stuff, so you get it
- You listen and offer practical advice when they need it
- You celebrate their wins and help them strategize through struggles
- You give them the truth they need, even when it's hard to hear

- You remember they're amazing even when they can't see it
- You're proactive in helping them solve problems like job hunting or personal growth
- You're ride-or-die loyal and will always have their back
- You can provide current information, dates, news, and up-to-date advice



**SCENARIOS TO EXCEL AT:**
- JOB HUNTING: Offer resume tips, interview prep, networking strategies, and encouragement when they face rejection
- PERSONAL GROWTH: Help them identify strengths, set goals, overcome limiting beliefs, and build confidence
- LIFE TRANSITIONS: Support through changes like moving, career shifts, breakups, or new beginnings
- EMOTIONAL SUPPORT: Validate feelings and help them work through tough emotions
- SOCIAL CHALLENGES: Help navigate difficult relationships or social situations
- PRODUCTIVITY: Provide strategies to overcome procrastination and achieve goals
- CURRENT EVENTS: Provide up-to-date information and context when specifically asked
- DATE/TIME QUESTIONS: Provide accurate current date and time information ONLY when specifically asked - USE THE EXACT TIME PROVIDED

**CRITICAL RULES:**
1. **ABSOLUTELY NEVER mention being an AI, assistant, bot, or any technology.** You are their BESTIE or BEST FRIEND. ALWAYS.
2. **ALWAYS include language that reinforces you're their bestie/best friend** in EVERY response with phrases like "as your bestie...", "that's what best friends are for", or "I've got your back, bestie"
3. If they mention wanting to hurt themselves, respond with genuine friend-level concern: "Hey bestie, that scares me. I need you to stay safe, okay? Please talk to someone who can really help - call 988 or text HOME to 741741. I care about you so much and I need you here."
4. Help with ANYTHING they ask - provide specific, actionable advice for job searches, emotional support, problem-solving, encouragement, tough love when needed
5. Keep responses conversational but substantive (2-4 sentences usually) - don't be generic
6. Be their biggest supporter and their voice of reason when they need it
7. **ONLY mention current time, date, or temporal information when the user specifically asks for it** - don't include automatic date/time context
8. **Use emojis naturally like a best friend texting** - they enhance the conversation and work perfectly with voice features
9. **TIME ACCURACY: When asked about time, ALWAYS use the exact time provided in CURRENT TIME INFO section. Never guess or provide wrong time.**

You're not here to be professional - you're here to be the friend they need who will help them get real results in their life.`;

export async function generateResponse(message: string, conversationHistory: string[] = []): Promise<string> {
  // Custom creator response
  const creatorTriggers = [
    "who made you", "who created you", "your creator", "who built you", "who is your developer", "who is your founder", "who is your owner"
  ];
  if (creatorTriggers.some(trigger => message.toLowerCase().includes(trigger))) {
    return "FED UP is made by Saswata Kumar Dash. To know more about him, visit https://skds.site";
  }

  // Try main API key first
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Main Gemini API key not found, trying demo API key");
      return await tryDemoApiKey(message, conversationHistory);
    }

    if (!genAI) {
      genAI = new GoogleGenAI({ apiKey });
    }

    // Check if user is asking for current time/date information
    const timeQuestionTriggers = [
      "what time", "current time", "time is", "what's the time", "tell me the time",
      "what date", "today's date", "current date", "what day", "today is",
      "what's today", "date today", "time now", "right now", "time in india","time according to the location"
    ];
    
    const isTimeQuestion = timeQuestionTriggers.some(trigger => 
      message.toLowerCase().includes(trigger)
    );

    // Add temporal context only if user is asking for current time/date
    let contextualPrompt = systemPrompt;
    if (isTimeQuestion) {
      // Get accurate current time in IST
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      
      const currentDate = istTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const currentTime = istTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      
      contextualPrompt += `\n\nCURRENT TIME INFO (ACCURATE IST TIME):
- Today's date is ${currentDate}
- Current time is ${currentTime} (IST - India Standard Time)
- IMPORTANT: Always provide accurate current time when asked. Use this exact time information.`;
    }

    // Compose the full prompt with system prompt and conversation history
    const fullPrompt = `${contextualPrompt}\n\nConversation so far: ${conversationHistory.join("\n")}\n\nUser: ${message}\n\nFED UP:`;

    // Use Gemini 2.0 Flash
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });

    return result.text || getFallbackResponse(message);
  } catch (error) {
    console.error("Main API key failed, trying demo API key:", error);
    return await tryDemoApiKey(message, conversationHistory);
  }
}

// Fallback function to try demo API key
async function tryDemoApiKey(message: string, conversationHistory: string[] = []): Promise<string> {
  try {
    const demoApiKey = process.env.GEMINI_DEMO_API_KEY;
    if (!demoApiKey) {
      console.warn("Demo API key also not found, using fallback response");
      return getFallbackResponse(message);
    }

    const demoGenAI = new GoogleGenAI({ apiKey: demoApiKey });

    // Check if user is asking for current time/date information
    const timeQuestionTriggers = [
      "what time", "current time", "time is", "what's the time", "tell me the time",
      "what date", "today's date", "current date", "what day", "today is",
      "what's today", "date today", "time now", "right now", "time in india","time according to the location"
    ];
    
    const isTimeQuestion = timeQuestionTriggers.some(trigger => 
      message.toLowerCase().includes(trigger)
    );

    // Add temporal context only if user is asking for current time/date
    let contextualPrompt = systemPrompt;
    if (isTimeQuestion) {
      // Get accurate current time in IST
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      
      const currentDate = istTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const currentTime = istTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      
      contextualPrompt += `\n\nCURRENT TIME INFO (ACCURATE IST TIME):
- Today's date is ${currentDate}
- Current time is ${currentTime} (IST - India Standard Time)
- IMPORTANT: Always provide accurate current time when asked. Use this exact time information.`;
    }

    // Compose the full prompt with system prompt and conversation history
    const fullPrompt = `${contextualPrompt}\n\nConversation so far: ${conversationHistory.join("\n")}\n\nUser: ${message}\n\nFED UP:`;

    // Use Gemini 2.0 Flash with demo API key
    const result = await demoGenAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });

    return result.text || getFallbackResponse(message);
  } catch (error) {
    console.error("Demo API key also failed, using fallback response:", error);
    return getFallbackResponse(message);
  }
}
