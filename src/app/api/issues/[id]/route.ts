import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const issue = await prisma.issue.update({
    where: { id: params.id },
    data: {
      ...(body.resolved !== undefined && { resolved: body.resolved }),
      ...(body.title && { title: body.title }),
      ...(body.description && { description: body.description }),
    },
  });

  return NextResponse.json(issue);
}
