import { NextRequest, NextResponse } from 'next/server';
import { generateDemoResponse } from '@/lib/gemini-demo';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    try {
      const response = await generateDemoResponse(message);
      return NextResponse.json({ response });
    } catch (error) {
      console.error('Demo Gemini Error:', error);
      return NextResponse.json({ 
        response: "Hey, I'm here for you. What's going on?"
      });
    }
  } catch (error) {
    console.error('Demo API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
