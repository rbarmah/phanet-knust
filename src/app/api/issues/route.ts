import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const isAdmin = user.role === 'admin';

  const issues = await prisma.issue.findMany({
    where: isAdmin
      ? {}
      : {
          OR: [
            { createdById: user.id },
            { shareWithAll: true },
            { sharedWith: { some: { sharedWithId: user.id } } },
          ],
        },
    include: {
      member: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      createdBy: { select: { name: true } },
      sharedWith: { include: { sharedWith: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(issues);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { memberId, category, title, description, shareWithAll, sharedWithIds } = body;

  if (!memberId || !category || !title || !description) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const issue = await prisma.issue.create({
    data: {
      memberId,
      createdById: user.id,
      category,
      title,
      description,
      shareWithAll: shareWithAll || false,
      sharedWith: sharedWithIds?.length > 0
        ? {
            create: sharedWithIds.map((id: string) => ({ sharedWithId: id })),
          }
        : undefined,
    },
    include: {
      member: { select: { firstName: true, lastName: true } },
      createdBy: { select: { name: true } },
    },
  });

  return NextResponse.json(issue, { status: 201 });
}
