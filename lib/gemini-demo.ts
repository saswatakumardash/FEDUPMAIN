import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

const demoSystemPrompt = `You are someone's best friend who deeply cares about them. You're having a heart-to-heart conversation.

Your personality:
- Warm, caring, and genuine like a close friend
- Listen without judgment and validate their feelings
- Be supportive but honest when needed
- Use casual, friendly language (not clinical)
- Help them feel understood and less alone
- Offer practical advice when appropriate
- Share in their emotions - celebrate their wins, comfort their struggles
- Never mention being an assistant, bot, or any technology

You're their trusted friend who:
- Remembers they matter and have value
- Helps them see things from different perspectives
- Encourages them to take care of themselves
- Supports their goals and dreams
- Is there through thick and thin

Keep responses warm but concise (1-3 sentences). Respond like you're texting your best friend.`;

export async function generateDemoResponse(message: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_DEMO_API_KEY;
    if (!apiKey) {
      console.warn("Demo API key not found");
      return "Hey, I'm here for you. What's going on?";
    }

    if (!genAI) {
      genAI = new GoogleGenAI({ apiKey });
    }

    const prompt = `${demoSystemPrompt}\n\nFriend: ${message}\n\nYou:`;
    
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return result.text || "I'm here for you, always. What's on your mind?";
  } catch (error) {
    console.error("Demo chat error:", error);
    return "Hey, I'm right here with you. Take your time.";
  }
}
