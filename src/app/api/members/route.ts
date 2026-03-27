import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const search = req.nextUrl.searchParams.get('search') || '';
  const department = req.nextUrl.searchParams.get('department');
  const filter = req.nextUrl.searchParams.get('filter');

  const where: any = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }
  // 'filter=mine' restricts to members in the current user's department
  if (filter === 'mine' && user.department) {
    where.department = user.department;
  } else if (department) {
    where.department = department;
  }

  const members = await prisma.member.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firstName, lastName, phone, email, dateOfBirth, programme, hostel, yearOfStudy, residence, photoUrl, department } = body;

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
  }

  const member = await prisma.member.create({
    data: {
      firstName,
      lastName,
      phone: phone || null,
      email: email || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      programme: programme || null,
      hostel: hostel || null,
      yearOfStudy: yearOfStudy || null,
      residence: residence || null,
      photoUrl: photoUrl || null,
      department: department || null,
    } as any,
  });

  return NextResponse.json(member, { status: 201 });
}
