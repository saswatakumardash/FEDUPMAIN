import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  // Set CORS headers
  const allowedOrigins = ['https://fedupmain.vercel.app', 'http://localhost:3000'];
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
    const { name, email } = await req.json();
    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400, headers });
    }
    // Check for duplicate email
    const q = query(collection(db, 'waitlist'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return NextResponse.json({ error: 'This email is already on the waitlist.' }, { status: 409, headers });
    }
    await addDoc(collection(db, 'waitlist'), { name, email, createdAt: new Date() });
    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500, headers });
  }
} 