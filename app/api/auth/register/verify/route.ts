import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import OTP from '@/lib/models/OTP';

export async function POST(req: Request) {
  try {
    const { email, code, name, password } = await req.json();

    if (!email || !code || !name || !password) {
      return new Response('All fields are required', { status: 400 });
    }

    await dbConnect();

    // Verify OTP
    const otpDoc = await OTP.findOne({ email, code, used: false });
    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      return new Response('Invalid or expired verification code', { status: 400 });
    }

    // Role Logic: only samkiel.dev@gmail.com becomes admin
    const role = email.toLowerCase() === 'samkiel.dev@gmail.com' ? 'admin' : 'user';

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    // Mark OTP as used
    otpDoc.used = true;
    await otpDoc.save();

    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return new Response('User already exists', { status: 400 });
    }
    console.error('Verify registration error:', error);
    const message = error instanceof Error ? error.message : 'Error creating account';
    return new Response(message, { status: 500 });
  }
}
