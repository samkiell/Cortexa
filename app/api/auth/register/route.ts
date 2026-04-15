import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Settings from '@/lib/models/Settings';
import OTP from '@/lib/models/OTP';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return new Response('All fields are required', { status: 400 });
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

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in DB
    await OTP.deleteMany({ email }); // Clear any previous ones
    await OTP.create({ email, code, expiresAt });

    // Send styled email via Resend
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Cortexa <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your Cortexa account',
      html: `
        <div style="background-color: #0d0d0d; color: #f9fafb; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #1e1e1e;">
          <h1 style="color: #6d61ff; font-weight: 800; margin-bottom: 24px; text-align: center;">Cortexa</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #9ca3af; text-align: center;">Finish creating your account by entering the code below.</p>
          <div style="background-color: #161616; padding: 20px; border-radius: 8px; margin: 32px 0; border: 1px solid #2a2a2a; text-align: center;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #f9fafb;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #6b7280; text-align: center;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response('Failed to send verification code', { status: 500 });
    }

    return NextResponse.json({ message: 'Verification code sent to email' }, { status: 200 });
  } catch (error: any) {
    console.error('Registration OTP error:', error);
    return new Response(error.message || 'Error sending code', { status: 500 });
  }
}
