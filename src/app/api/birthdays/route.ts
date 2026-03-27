import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const currentMonth = now.getMonth();

  const members = await prisma.member.findMany({
    where: {
      dateOfBirth: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      phone: true,
      email: true,
      photoUrl: true,
      department: true,
    },
    orderBy: { dateOfBirth: 'asc' },
  });

  // Filter for this month's birthdays and sort by day
  const birthdayMembers = members
    .filter(m => m.dateOfBirth && m.dateOfBirth.getMonth() === currentMonth)
    .sort((a, b) => {
      const dayA = a.dateOfBirth!.getDate();
      const dayB = b.dateOfBirth!.getDate();
      return dayA - dayB;
    });

  return NextResponse.json(birthdayMembers);
}
