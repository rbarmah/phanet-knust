import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST() {
  // Auto-mark absent: find services that ended 12+ hours ago where members have no attendance record
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

  const services = await prisma.service.findMany({
    where: {
      date: { lt: twelveHoursAgo },
    },
  });

  let marked = 0;
  for (const service of services) {
    const allMembers = await prisma.member.findMany({ select: { id: true } });
    const existingAttendance = await prisma.attendance.findMany({
      where: { serviceId: service.id },
      select: { memberId: true },
    });

    const attendedMemberIds = new Set(existingAttendance.map(a => a.memberId));
    const absentMembers = allMembers.filter(m => !attendedMemberIds.has(m.id));

    if (absentMembers.length > 0) {
      await (prisma.attendance.createMany as any)({
        data: absentMembers.map(m => ({
          memberId: m.id,
          serviceId: service.id,
          present: false,
          autoMarked: true,
          markedAt: new Date(),
        })),
        skipDuplicates: true,
      });
      marked += absentMembers.length;
    }
  }

  return NextResponse.json({ success: true, marked });
}
