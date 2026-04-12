import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Settings from '@/lib/models/Settings';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return new Response('Email and password are required', { status: 400 });
    }

    await dbConnect();

    // Check if registration is allowed
    const settings = await Settings.findOne();
    if (settings && settings.allowRegistration === false) {
      return new Response('Registration is currently closed', { status: 403 });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return new Response('User already exists', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // If no users exist, the first one becomes admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

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
  } catch (error: any) {
    console.error('Registration error:', error);
    return new Response(error.message || 'Error creating user', { status: 500 });
  }
}
