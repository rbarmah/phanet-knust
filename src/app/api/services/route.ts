import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const services = await prisma.service.findMany({
    orderBy: { date: 'desc' },
    include: {
      _count: { select: { attendance: true, finances: true } },
    },
  });

  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can create services' }, { status: 403 });
  }

  const body = await req.json();
  const { name, date, type, description } = body;

  if (!name || !date) {
    return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      name,
      date: new Date(date),
      type: type || 'regular',
      description: description || null,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
