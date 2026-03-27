import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = req.nextUrl.searchParams.get('serviceId');
  if (!serviceId) return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });

  const attendance = await prisma.attendance.findMany({
    where: { serviceId },
    include: {
      member: {
        select: { id: true, firstName: true, lastName: true, photoUrl: true, phone: true },
      },
    },
    orderBy: { member: { firstName: 'asc' } },
  });

  return NextResponse.json(attendance);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { serviceId, memberId, present } = body;

  if (!serviceId || !memberId) {
    return NextResponse.json({ error: 'serviceId and memberId are required' }, { status: 400 });
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      memberId_serviceId: { memberId, serviceId },
    },
    update: {
      present: present ?? true,
      markedAt: new Date(),
      autoMarked: false,
    },
    create: {
      memberId,
      serviceId,
      present: present ?? true,
      markedAt: new Date(),
      autoMarked: false,
    },
  });

  return NextResponse.json(attendance);
}
