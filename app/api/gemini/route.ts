import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/lib/gemini';
import { generateDemoResponse } from '@/lib/gemini-demo';

export async function POST(req: NextRequest) {
  // Set CORS headers
  const allowedOrigins = ['https://fedupmain.vercel.app', 'http://localhost:3000', 'https://fedup.skds.site'];
  const origin = req.headers.get('origin') || '';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }
  
  try {
    const { message, conversationHistory } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400, headers });
    }

    try {
      // Build conversation history for Gemini - using full generateResponse for main chat
      const response = await generateResponse(message, conversationHistory || []);
      return NextResponse.json({ response }, { headers });
    } catch (error) {
      console.error('Gemini Error:', error);
      return NextResponse.json({ 
        response: "Hey bestie, I'm here for you - always. What's been going on lately? Maybe I can help brainstorm some solutions. That's what best friends are for!"
      }, { headers });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers });
  }
}