import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const finances = await prisma.finance.findMany({
    include: {
      service: { select: { id: true, name: true, date: true, type: true } },
    },
    orderBy: { service: { date: 'desc' } },
  });

  return NextResponse.json(finances);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can manage finances' }, { status: 403 });
  }

  const body = await req.json();
  const { serviceId, offering, tithe, otherIncome, notes } = body;

  if (!serviceId) {
    return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
  }

  // Upsert - one finance record per service
  const existing = await prisma.finance.findFirst({ where: { serviceId } });

  let finance;
  if (existing) {
    finance = await prisma.finance.update({
      where: { id: existing.id },
      data: {
        offering: offering ?? 0,
        tithe: tithe ?? 0,
        otherIncome: otherIncome ?? 0,
        notes: notes || null,
      },
    });
  } else {
    finance = await prisma.finance.create({
      data: {
        serviceId,
        offering: offering ?? 0,
        tithe: tithe ?? 0,
        otherIncome: otherIncome ?? 0,
        notes: notes || null,
      },
    });
  }

  return NextResponse.json(finance, { status: 201 });
}
