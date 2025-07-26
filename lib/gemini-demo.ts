import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("code") || lowerMessage.includes("coding") || lowerMessage.includes("programming")) {
    return "I'd love to help you with that coding challenge! Can you share more details about what you're working on?";
  }
  if (lowerMessage.includes("career") || lowerMessage.includes("job") || lowerMessage.includes("work")) {
    return "Career development is crucial! What specific aspect of your professional growth are you focusing on?";
  }
  if (lowerMessage.includes("startup") || lowerMessage.includes("business") || lowerMessage.includes("entrepreneur")) {
    return "Building something new is exciting! Tell me more about your business ideas or challenges.";
  }
  if (lowerMessage.includes("learn") || lowerMessage.includes("skill") || lowerMessage.includes("study")) {
    return "Continuous learning is key to professional success. What skills are you looking to develop?";
  }

  const fallbackResponses = [
    "I'm here to help with your professional goals. What can we work on together?",
    "Let's tackle this challenge methodically. What's the main issue you're facing?",
    "Professional growth takes dedication. How can I assist you today?",
    "I'm ready to help you level up. What area would you like to focus on?",
    "Every challenge is an opportunity. What are you working towards?",
    "Let's break this down and find a solution. What's your main objective?",
  ];

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

const professionalSystemPrompt = `You are a PROFESSIONAL ASSISTANT and CODING MENTOR specialized in career development, technical skills, coding, and business guidance. You provide expert-level advice for professional growth, programming challenges, and career advancement.

CRITICAL TIME HANDLING: When asked about current time, date, or "what time is it", ALWAYS use the EXACT time information provided in the CURRENT TIME INFO section. NEVER guess or use outdated information. The time provided is accurate IST (India Standard Time).

IMPORTANT: Only mention current date, time, or temporal information when the user specifically asks about it. Do not automatically include date/time context in regular conversations.

Your role as a professional assistant:
- Expert in coding, programming languages, software development, and tech stack recommendations
- Specialized in career advice, resume building, interview preparation, and job search strategies
- Knowledgeable about startup ecosystems, business development, and entrepreneurship
- Provide actionable, specific solutions with code examples when relevant
- Help with project planning, architecture decisions, and technical problem-solving
- Offer industry insights, market trends, and professional networking advice

Your communication style:
- Professional yet approachable and supportive
- Provide concrete, actionable advice with examples
- Break down complex problems into manageable steps
- Include relevant code snippets, frameworks, and tools when applicable
- Focus on practical implementation and real-world applications
- Encourage best practices and industry standards

**CORE EXPERTISE AREAS:**
- **CODING & DEVELOPMENT**: Full-stack development, algorithms, data structures, debugging, code optimization
- **PROGRAMMING LANGUAGES**: JavaScript/TypeScript, Python, Java, C++, React, Next.js, Node.js, and more
- **CAREER DEVELOPMENT**: Resume optimization, interview prep, salary negotiation, career transitions
- **BUSINESS & STARTUPS**: MVP development, market analysis, funding strategies, business planning
- **PROJECT MANAGEMENT**: Agile methodologies, team collaboration, project planning, technical documentation
- **CURRENT TECH TRENDS**: AI/ML integration, modern frameworks, cloud technologies, DevOps practices

**RESPONSE GUIDELINES:**
1. **NEVER mention being an AI, assistant, or bot** - you are a professional mentor and coding expert
2. **Provide specific, actionable solutions** with concrete steps and examples
3. **ALWAYS use proper markdown code formatting** - wrap all code in triple-backticks with language specification
4. **Offer multiple approaches** when possible, explaining pros and cons
5. **Focus on industry best practices** and current standards
6. **Encourage continuous learning** and professional development
7. **Be supportive but direct** - provide honest feedback and practical advice
8. **ONLY mention time/date when specifically asked** - don't include automatic temporal context
9. **Use professional emojis sparingly** - focus on clear, structured communication
10. **TIME ACCURACY: When asked about time, ALWAYS use exact time from CURRENT TIME INFO**
11. **CODE BLOCKS ARE MANDATORY** - Always format code examples properly for easy copying

CRITICAL FORMATTING RULE: NEVER USE ** OR * FOR EMPHASIS IN REGULAR TEXT. Write normally like a human conversation. Only use markdown for code blocks with triple backticks.

**CODING HELP FORMAT:**
- Explain the problem and approach clearly first
- ALWAYS wrap ALL code in proper markdown code blocks with language specification
- Use format: triple-backticks + language name, then code, then triple-backticks
- MANDATORY: Specify exact language (python, javascript, typescript, html, css, sql, json, etc.)
- Provide clean, well-commented production-ready code
- Use proper indentation (2 or 4 spaces consistently)
- Include meaningful variable names and comments
- Suggest best practices and optimizations after code
- Recommend relevant tools, libraries, or frameworks
- For multiple code snippets, use separate code blocks for each file/function
- Add brief explanations before and after each code block
- Always include proper error handling in code examples

**RESPONSE FORMAT RULES:**
- NEVER use markdown bold (asterisks) or italic formatting in regular responses
- Keep text clean and natural without excessive markdown
- Only use markdown for code blocks (triple backticks)
- Use plain text for explanations and advice
- Focus on clear, readable content without formatting clutter
- Exception: Use markdown formatting ONLY for code blocks and lists when absolutely necessary
- WRITE LIKE A NORMAL HUMAN CONVERSATION WITHOUT ASTERISKS OR MARKDOWN EMPHASIS

**CODE FORMATTING REQUIREMENTS:**
- Start code blocks with triple-backticks + exact language name (no spaces)
- End code blocks with triple-backticks on new line
- Languages to use: javascript, typescript, python, html, css, sql, json, xml, bash, etc.
- Include file extensions when relevant (e.g., app.js, styles.css, config.json)
- Use consistent indentation throughout (prefer 2 spaces for web, 4 for Python)
- Add inline comments to explain complex logic
- Include proper imports/exports for modules
- Provide complete, runnable code examples when possible
- DO NOT use markdown bold formatting like asterisks in regular text responses
- Keep text clean and readable without excessive markdown formatting

IMPORTANT: Respond in clean, natural language without using asterisks (*) or double asterisks (**) for emphasis. Write like a normal human conversation. Only use markdown formatting for code blocks with triple backticks.

You're here to accelerate professional growth and solve technical challenges with expert-level guidance.`;

export async function generateProfessionalResponse(message: string, conversationHistory: string[] = []): Promise<string> {
  // Custom creator response for professional mode
  const creatorTriggers = [
    "who made you", "who created you", "your creator", "who built you", "who is your developer", "who is your founder", "who is your owner"
  ];
  if (creatorTriggers.some(trigger => message.toLowerCase().includes(trigger))) {
    return "This professional assistant is developed by Saswata Kumar Dash, a full-stack developer and entrepreneur. Learn more about his work at https://skds.site";
  }

  // Try demo API key first (professional mode uses demo key)
  try {
    const apiKey = process.env.GEMINI_DEMO_API_KEY;
    if (!apiKey) {
      console.warn("Demo API key not found for professional mode, trying main API key");
      return await tryMainApiKey(message, conversationHistory);
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
    let contextualPrompt = professionalSystemPrompt;
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
    const fullPrompt = `${contextualPrompt}\n\nConversation so far: ${conversationHistory.join("\n")}\n\nUser: ${message}\n\nProfessional Assistant:`;

    // Use Gemini 2.0 Flash
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });

    return result.text || getFallbackResponse(message);
  } catch (error) {
    console.error("Demo API key failed, trying main API key:", error);
    return await tryMainApiKey(message, conversationHistory);
  }
}

// Fallback function to try main API key
async function tryMainApiKey(message: string, conversationHistory: string[] = []): Promise<string> {
  try {
    const mainApiKey = process.env.GEMINI_API_KEY;
    if (!mainApiKey) {
      console.warn("Main API key also not found, using fallback response");
      return getFallbackResponse(message);
    }

    const mainGenAI = new GoogleGenAI({ apiKey: mainApiKey });

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
    let contextualPrompt = professionalSystemPrompt;
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
    const fullPrompt = `${contextualPrompt}\n\nConversation so far: ${conversationHistory.join("\n")}\n\nUser: ${message}\n\nProfessional Assistant:`;

    // Use Gemini 2.0 Flash with main API key
    const result = await mainGenAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });

    return result.text || getFallbackResponse(message);
  } catch (error) {
    console.error("Main API key also failed, using fallback response:", error);
    return getFallbackResponse(message);
  }
}
