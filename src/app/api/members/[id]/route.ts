import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: {
      issues: {
        include: { createdBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      attendance: {
        include: { service: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  return NextResponse.json(member);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { firstName, lastName, phone, email, dateOfBirth, programme, hostel, yearOfStudy, residence, photoUrl, department } = body;

  const member = await prisma.member.update({
    where: { id: params.id },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
      ...(programme !== undefined && { programme }),
      ...(hostel !== undefined && { hostel }),
      ...(yearOfStudy !== undefined && { yearOfStudy }),
      ...(residence !== undefined && { residence }),
      ...(photoUrl !== undefined && { photoUrl }),
      ...(department !== undefined && { department }),
    },
  });

  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can delete members' }, { status: 403 });
  }

  await prisma.member.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
