/**
 * One-time script to remove all department_lead users from the database.
 * Also cleans up related Issue and IssueShare records to avoid FK constraint errors.
 *
 * Usage: node prisma/cleanup-leads.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all department_lead users
  const leads = await prisma.user.findMany({
    where: { role: 'department_lead' },
    select: { id: true, name: true, email: true },
  });

  console.log(`Found ${leads.length} department lead(s) to remove:`);
  leads.forEach(l => console.log(`  - ${l.name} (${l.email})`));

  if (leads.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  const leadIds = leads.map(l => l.id);

  // Delete IssueShares where the lead is the sharedWith user
  const deletedShares = await prisma.issueShare.deleteMany({
    where: { sharedWithId: { in: leadIds } },
  });
  console.log(`Deleted ${deletedShares.count} issue share(s).`);

  // Delete Issues created by these leads
  const deletedIssues = await prisma.issue.deleteMany({
    where: { createdById: { in: leadIds } },
  });
  console.log(`Deleted ${deletedIssues.count} issue(s) created by leads.`);

  // Delete the department_lead users
  const deletedUsers = await prisma.user.deleteMany({
    where: { role: 'department_lead' },
  });
  console.log(`Deleted ${deletedUsers.count} department lead user(s).`);

  console.log('Done! All department leads have been removed.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
