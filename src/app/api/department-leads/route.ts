import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const leads = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });

  // Count members per department
  const memberCounts = await prisma.member.groupBy({
    by: ['department'],
    _count: { id: true },
  });

  const countMap: Record<string, number> = {};
  memberCounts.forEach((mc: any) => {
    if (mc.department) countMap[mc.department] = mc._count.id;
  });

  return NextResponse.json(leads.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: s.role,
    department: (s as any).department || null,
    memberCount: (s as any).department ? (countMap[(s as any).department] || 0) : 0,
    createdAt: s.createdAt,
  })));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, phone, role, department } = body;

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const tempPassword = password || Math.random().toString(36).slice(-8) + 'A1!';
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: role || 'department_lead',
      department: department || null,
      mustChangePassword: true,
    } as any,
  });

  return NextResponse.json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    department: (newUser as any).department,
    tempPassword,
  }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Prevent admins from deleting themselves
  if (id === user.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  // Check the user exists
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Clean up related records
  await prisma.issueShare.deleteMany({ where: { sharedWithId: id } });
  await prisma.issue.deleteMany({ where: { createdById: id } });

  // Delete the user
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
