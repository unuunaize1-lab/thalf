const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log('--- CATEGORIES IN DB ---');
  console.log(JSON.stringify(categories, null, 2));

  const count = await prisma.product.count({ where: { isDeleted: false } });
  console.log('\n--- EXISTING PRODUCTS COUNT ---');
  console.log('Count:', count);

  const existingProducts = await prisma.product.findMany({
    where: { isDeleted: false },
    take: 5,
    select: { id: true, name: true, sku: true, slug: true, price: true, categoryId: true, status: true }
  });
  console.log('Sample Products:', JSON.stringify(existingProducts, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
