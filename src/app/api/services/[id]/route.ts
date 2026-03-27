import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = await prisma.service.findUnique({
    where: { id: params.id },
    include: {
      attendance: {
        include: { member: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } },
      },
      finances: true,
    },
  });

  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  return NextResponse.json(service);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can edit services' }, { status: 403 });
  }

  const body = await req.json();
  const service = await prisma.service.update({
    where: { id: params.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.date && { date: new Date(body.date) }),
      ...(body.type && { type: body.type }),
      ...(body.description !== undefined && { description: body.description }),
    },
  });

  return NextResponse.json(service);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can delete services' }, { status: 403 });
  }

  await prisma.service.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
