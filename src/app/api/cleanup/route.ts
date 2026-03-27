import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// One-time cleanup: remove members who are also department leads/users
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  // Get all users (department leads/admins)
  const users = await prisma.user.findMany({
    select: { email: true, phone: true, name: true },
  });

  const userEmails = new Set(users.map(u => u.email.toLowerCase()));
  const userPhones = new Set(users.filter(u => u.phone).map(u => u.phone!));

  // Find members that match a user by email or phone
  const allMembers = await prisma.member.findMany({
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  });

  const duplicates = allMembers.filter(m => {
    if (m.email && userEmails.has(m.email.toLowerCase())) return true;
    if (m.phone && userPhones.has(m.phone)) return true;
    // Also check name matches
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return users.some(u => u.name.toLowerCase() === fullName);
  });

  let removed = 0;
  for (const dup of duplicates) {
    // Delete related records first
    await prisma.attendance.deleteMany({ where: { memberId: dup.id } });
    await prisma.issue.deleteMany({ where: { memberId: dup.id } });
    await prisma.member.delete({ where: { id: dup.id } });
    removed++;
  }

  return NextResponse.json({
    success: true,
    removed,
    removedMembers: duplicates.map(d => `${d.firstName} ${d.lastName} (${d.email || d.phone})`),
  });
}
