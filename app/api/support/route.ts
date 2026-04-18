import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { subject, message, email } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    // Determine email: session email or manually provided email for guests
    const userEmail = session?.user?.email || email;

    if (!userEmail) {
      return NextResponse.json({ error: 'Email is required for guest submissions' }, { status: 400 });
    }

    await dbConnect();
    const ticket = await SupportTicket.create({
      userId: session?.user?.id || null,
      userEmail,
      subject,
      message,
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Support submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
