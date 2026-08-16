const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('--- STARTING DATABASE PERSISTENCE VERIFICATION TEST ---');

  // Step 1: Create a test product with valid Admin fields
  const category = await prisma.category.findFirst();
  if (!category) {
    throw new Error('No category found in database to assign test product.');
  }

  const testSku = `THF-TEST-PERSIST-${Date.now()}`;
  const testSlug = `test-persist-product-${Date.now()}`;
  const testName = 'THALF Persistence Test Artisan Dark Bar';

  console.log(`\n[1] Creating test product through Prisma/ProductRepository logic:`);
  console.log(`    Name: ${testName}`);
  console.log(`    SKU: ${testSku}`);

  const testProduct = await prisma.product.create({
    data: {
      name: testName,
      sku: testSku,
      slug: testSlug,
      description: 'Automated test product for database persistence verification.',
      price: 1950.00,
      comparePrice: 2200.00,
      status: 'ACTIVE',
      featured: true,
      cacaoPercentage: 85,
      weight: '100g',
      flavourProfile: 'Rich cocoa, dark berries, vanilla finish',
      category: { connect: { id: category.id } },
      inventory: {
        create: {
          stockQuantity: 50,
          reservedStock: 0,
        },
      },
    },
    include: {
      category: true,
      inventory: true,
    },
  });

  const productId = testProduct.id;
  console.log(`✅ Test Product Created in DB! ID: ${productId}`);

  // Step 2: Query PostgreSQL to verify existence
  console.log(`\n[2] Verifying record in PostgreSQL table "Product":`);
  const fetchedFromPg = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true, inventory: true },
  });

  if (!fetchedFromPg || fetchedFromPg.sku !== testSku) {
    throw new Error('FAILED: Product not found in PostgreSQL immediately after creation!');
  }
  console.log(`✅ Verified in PostgreSQL: Found product ID '${fetchedFromPg.id}' with status '${fetchedFromPg.status}' and price '${fetchedFromPg.price}'`);

  // Step 3: Simulate Admin/Storefront querying
  console.log(`\n[3] Simulating Admin API / Storefront API query for ACTIVE products:`);
  const activeProducts = await prisma.product.findMany({
    where: { isDeleted: false, status: 'ACTIVE' },
    include: { category: true, inventory: true },
  });
  const foundInActiveList = activeProducts.some(p => p.id === productId);
  if (!foundInActiveList) {
    throw new Error('FAILED: Test product not returned by ACTIVE catalog query!');
  }
  console.log(`✅ Product present in active catalog query (Total active products in PostgreSQL: ${activeProducts.length})`);

  // Step 4: Disconnect client and simulate process/server restart
  console.log(`\n[4] Simulating Next.js Server Restart (Disconnecting Prisma client and re-instantiating):`);
  await prisma.$disconnect();

  const newPrismaClient = new PrismaClient();
  const fetchedAfterRestart = await newPrismaClient.product.findUnique({
    where: { id: productId },
  });

  if (!fetchedAfterRestart) {
    throw new Error('FAILED: Test product disappeared after Prisma client re-initialization / server restart!');
  }
  console.log(`✅ Verified after server/process restart: Product '${fetchedAfterRestart.id}' remains permanently in PostgreSQL!`);

  await newPrismaClient.$disconnect();
  console.log('\n--- VERIFICATION COMPLETED SUCCESSFULLY ---');
  return productId;
}

runTest()
  .then((id) => {
    console.log(`PERSISTENCE_TEST_PASSED_PRODUCT_ID:${id}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('PERSISTENCE_TEST_FAILED:', err);
    process.exit(1);
  });
