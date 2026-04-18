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
  
      const { id, status, adminResponse } = await req.json();
  
      await dbConnect();
      const updateData: any = { status };
      if (adminResponse !== undefined) updateData.adminResponse = adminResponse;

      const ticket = await SupportTicket.findByIdAndUpdate(id, updateData, { new: true });

      if (ticket) {
        // Send notification email to the user
        try {
          await sendEmail({
            to: ticket.userEmail,
            subject: `Update on your request: ${ticket.subject}`,
            html: `
              <div style="background-color: #090909; color: #ffffff; padding: 40px; font-family: -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, helvetica, arial, sans-serif; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.08);">
                <div style="margin-bottom: 32px; text-align: left;">
                  <h1 style="color: #ffffff; font-size: 20px; font-weight: 500; margin: 0; letter-spacing: -0.01em;">Cortexa Support</h1>
                </div>
                
                <p style="font-size: 15px; line-height: 1.6; color: rgba(255, 255, 255, 0.6); margin-bottom: 24px;">
                  Hello, we've updated the status of your support request.
                </p>

                ${adminResponse ? `
                  <div style="margin-bottom: 32px; padding: 20px; background-color: rgba(37, 99, 235, 0.05); border-left: 2px solid #2563eb; border-radius: 4px;">
                    <div style="font-size: 12px; font-weight: 600; color: #2563eb; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Message from Specialist</div>
                    <div style="font-size: 15px; color: #ffffff; line-height: 1.6; font-style: italic;">"${adminResponse}"</div>
                  </div>
                ` : ''}

                <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); padding: 20px; border-radius: 8px;">
                  <div style="margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 500; color: rgba(255, 255, 255, 0.3); text-transform: uppercase; letter-spacing: 0.05em;">Request</div>
                    <div style="font-size: 14px; color: rgba(255, 255, 255, 0.8); margin-top: 4px;">${ticket.subject}</div>
                  </div>
                  <div>
                    <div style="font-size: 11px; font-weight: 500; color: rgba(255, 255, 255, 0.3); text-transform: uppercase; letter-spacing: 0.05em;">New Status</div>
                    <div style="font-size: 13px; color: #2563eb; margin-top: 4px; font-weight: 600; text-transform: capitalize;">• ${status}</div>
                  </div>
                </div>

                <p style="font-size: 12px; color: rgba(255, 255, 255, 0.2); text-align: center; margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.06); pt-24px;">
                  This is an automated notification from Cortexa.
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
