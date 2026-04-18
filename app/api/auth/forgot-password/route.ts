import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import OTP from '@/lib/models/OTP';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    // Find user by email. If not found, return an error
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Save new OTP doc with expiresAt = Date.now() + 10 * 60 * 1000
    await OTP.create({
      email,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send email via Nodemailer
    await sendEmail({
      to: email,
      subject: 'Your Cortexa verification code',
      html: `
        <div style="background-color: #0c0c0c; color: #ffffff; padding: 40px; font-family: sans-serif; border-radius: 8px;">
          <h1 style="color: #3b82f6; font-size: 24px; margin-bottom: 24px;">Cortexa</h1>
          <p style="font-size: 16px; margin-bottom: 24px;">Use the following code to reset your password:</p>
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 24px;">
            <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #6b7280;">This code expires in 10 minutes.</p>
          <div style="border-top: 1px solid #2a2a2a; margin-top: 40px; padding-top: 20px;">
            <p style="font-size: 12px; color: #4b5563;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
