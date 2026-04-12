import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OTP from '@/lib/models/OTP';
import jwt from 'jsonwebtoken';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    await dbConnect();

    // Find OTP doc where email matches, used is false, expiresAt > now
    const otpDoc = await OTP.findOne({
      email,
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Mark used: true
    otpDoc.used = true;
    await otpDoc.save();

    // Sign a short-lived JWT (15min) with { email, purpose: "reset" }
    const token = jwt.sign(
      { email, purpose: 'reset' },
      NEXTAUTH_SECRET,
      { expiresIn: '15m' }
    );

    return NextResponse.json({ success: true, token });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
