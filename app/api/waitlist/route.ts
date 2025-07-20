import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();
    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }
    // Check for duplicate email
    const q = query(collection(db, 'waitlist'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return NextResponse.json({ error: 'This email is already on the waitlist.' }, { status: 409 });
    }
    await addDoc(collection(db, 'waitlist'), { name, email, createdAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 