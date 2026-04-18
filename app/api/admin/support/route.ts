import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
import { sendEmail } from '@/lib/mail';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Admin fetch support error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { id, status } = await req.json();
  
      await dbConnect();
      const ticket = await SupportTicket.findByIdAndUpdate(id, { status }, { new: true });

      if (ticket) {
        // Send notification email to the user
        try {
          await sendEmail({
            to: ticket.userEmail,
            subject: `Support Update: ${ticket.subject}`,
            html: `
              <div style="background-color: #090909; color: #ffffff; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.08);">
                <div style="margin-bottom: 24px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 24px; font-weight: 500; margin: 0; tracking: -0.02em;">Cortexa Support</h1>
                </div>
                
                <p style="font-size: 15px; line-height: 1.6; color: rgba(255, 255, 255, 0.4); margin-bottom: 24px;">
                  The status of your support request has been updated.
                </p>

                <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                  <div style="margin-bottom: 12px;">
                    <span style="font-size: 12px; font-weight: 500; color: rgba(255, 255, 255, 0.2); text-transform: uppercase;">Subject</span>
                    <div style="font-size: 14px; color: #ffffff; margin-top: 4px;">${ticket.subject}</div>
                  </div>
                  <div>
                    <span style="font-size: 12px; font-weight: 500; color: rgba(255, 255, 255, 0.2); text-transform: uppercase;">New Status</span>
                    <div style="font-size: 14px; color: #2563eb; margin-top: 4px; font-weight: 500; text-transform: capitalize;">${status}</div>
                  </div>
                </div>

                <p style="font-size: 13px; color: rgba(255, 255, 255, 0.2); text-align: center; margin-top: 32px;">
                  This is an automated notification. Please do not reply directly to this email.
                </p>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      }
  
      return NextResponse.json(ticket);
    } catch (error) {
      console.error('Admin support PATCH error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
  
      await dbConnect();
      await SupportTicket.findByIdAndDelete(id);
  
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
