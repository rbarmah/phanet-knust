import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json();
  const { email, password, department } = body;

  const member = await prisma.member.findUnique({
    where: { id: params.id },
  });

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  const memberEmail = email || member.email;
  if (!memberEmail) {
    return NextResponse.json({ error: 'Member must have an email to be promoted' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: memberEmail } });
  if (existingUser) {
    return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
  }

  const tempPassword = password || Math.random().toString(36).slice(-8) + 'A1!';
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // First delete related records manually to avoid any FK issues
  await prisma.attendance.deleteMany({ where: { memberId: params.id } });
  await prisma.issue.deleteMany({ where: { memberId: params.id } });
  
  // Delete the member record
  await prisma.member.delete({ where: { id: params.id } });

  // Now create the department lead user account
  const newLead = await prisma.user.create({
    data: {
      name: `${member.firstName} ${member.lastName}`,
      email: memberEmail,
      password: hashedPassword,
      phone: member.phone,
      role: 'department_lead',
      department: department || null,
      mustChangePassword: true,
    } as any,
  });

  return NextResponse.json({
    id: newLead.id,
    name: newLead.name,
    email: newLead.email,
    phone: member.phone,
    department: (newLead as any).department,
    tempPassword,
  }, { status: 201 });
}
