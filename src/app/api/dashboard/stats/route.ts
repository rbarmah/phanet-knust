import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const isAdmin = user.role === 'admin';

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const [totalMembers, totalDepartmentLeads, myMembers, allMembers, openIssues, recentServices] = await Promise.all([
    prisma.member.count(),
    prisma.user.count({ where: { role: 'department_lead' } }),
    isAdmin
      ? prisma.user.count({ where: { role: 'department_lead' } })
      : user.department
        ? prisma.member.count({ where: { department: user.department } })
        : 0,
    prisma.member.findMany({ select: { dateOfBirth: true } }),
    isAdmin
      ? prisma.issue.count({ where: { resolved: false } })
      : prisma.issue.count({
          where: {
            resolved: false,
            OR: [
              { createdById: user.id },
              { shareWithAll: true },
              { sharedWith: { some: { sharedWithId: user.id } } },
            ],
          },
        }),
    prisma.service.count({
      where: {
        date: { gte: new Date(currentYear, currentMonth, 1) },
      },
    }),
  ]);

  // Count birthdays this month
  const upcomingBirthdays = allMembers.filter(m => {
    if (!m.dateOfBirth) return false;
    return m.dateOfBirth.getMonth() === currentMonth;
  }).length;

  return NextResponse.json({
    totalMembers,
    totalDepartmentLeads,
    myMembers,
    upcomingBirthdays,
    openIssues,
    recentServices,
  });
}
