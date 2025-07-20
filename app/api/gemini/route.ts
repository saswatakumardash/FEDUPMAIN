import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }
    const response = await generateResponse(message, conversationHistory || []);
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 