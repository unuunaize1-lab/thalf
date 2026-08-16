const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true },
  });
  console.log('--- ALL USERS IN DB ---');
  for (const u of users) {
    console.log(`ID: ${u.id} | Email: ${u.email} | Phone: ${u.phone} | Role: ${u.role?.name}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
