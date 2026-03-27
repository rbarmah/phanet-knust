// Run this script with: node scripts/cleanup-duplicates.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all users (shepherds/admins)
  const users = await prisma.user.findMany({
    select: { email: true, phone: true, name: true },
  });

  const userEmails = new Set(users.map(u => u.email.toLowerCase()));
  const userPhones = new Set(users.filter(u => u.phone).map(u => u.phone));

  // Find members that match a user by email, phone, or name
  const allMembers = await prisma.member.findMany({
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  });

  const duplicates = allMembers.filter(m => {
    if (m.email && userEmails.has(m.email.toLowerCase())) return true;
    if (m.phone && userPhones.has(m.phone)) return true;
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return users.some(u => u.name.toLowerCase() === fullName);
  });

  console.log(`Found ${duplicates.length} members who are also shepherds/admins:`);
  for (const d of duplicates) {
    console.log(`  - ${d.firstName} ${d.lastName} (${d.email || d.phone || 'no contact'})`);
  }

  if (duplicates.length === 0) {
    console.log('Nothing to clean up!');
    return;
  }

  for (const dup of duplicates) {
    await prisma.attendance.deleteMany({ where: { memberId: dup.id } });
    await prisma.issue.deleteMany({ where: { memberId: dup.id } });
    await prisma.member.delete({ where: { id: dup.id } });
    console.log(`  ✓ Removed ${dup.firstName} ${dup.lastName} from members list`);
  }

  console.log(`\nDone! Removed ${duplicates.length} duplicate records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
