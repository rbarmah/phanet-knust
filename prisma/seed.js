const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const leadPassword = await bcrypt.hash('lead123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@phanet.org' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@phanet.org',
      password: adminPassword,
      role: 'admin',
      phone: '+233000000000',
    },
  });

  const lead1 = await prisma.user.upsert({
    where: { email: 'lead1@phanet.org' },
    update: {},
    create: {
      name: 'John Mensah',
      email: 'lead1@phanet.org',
      password: leadPassword,
      role: 'department_lead',
      department: 'media-graphics',
      phone: '+233111111111',
    },
  });

  const lead2 = await prisma.user.upsert({
    where: { email: 'lead2@phanet.org' },
    update: {},
    create: {
      name: 'Grace Asante',
      email: 'lead2@phanet.org',
      password: leadPassword,
      role: 'department_lead',
      department: 'prayer',
      phone: '+233222222222',
    },
  });

  // Create a default form link
  await prisma.formLink.upsert({
    where: { token: 'public' },
    update: {},
    create: {
      token: 'public',
      active: true,
    },
  });

  console.log('Seeded:', { admin: admin.email, lead1: lead1.email, lead2: lead2.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
