import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';

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
  
      return NextResponse.json(ticket);
    } catch (error) {
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
