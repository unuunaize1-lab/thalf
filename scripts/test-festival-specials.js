require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runFestivalSpecialsTest() {
  console.log('\n==================================================');
  console.log('STARTING FESTIVAL SPECIALS END-TO-END VERIFICATION');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, description) {
    total++;
    if (condition) {
      console.log(`  [PASS] Item ${total}: ${description}`);
      passed++;
    } else {
      console.error(`  [FAIL] Item ${total}: ${description}`);
    }
  }

  try {
    // 1. Verify schema columns on Collection
    console.log('--- Test 1: Collection Schema Metadata Fields ---');
    const now = new Date();
    const testSlug = `fest-test-${Date.now()}`;
    const startDate = new Date(now.getTime() - 86400000); // Yesterday
    const endDate = new Date(now.getTime() + 86400000 * 30); // 30 days later

    const collection = await prisma.collection.create({
      data: {
        name: 'Diwali Festival Special 2026',
        slug: testSlug,
        description: 'Exclusive Diwali gift hampers and craft chocolates',
        bannerImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55',
        startDate,
        endDate,
        isActive: true,
        isFeatured: true,
        displayOrder: 1,
      },
    });

    assert(collection.id && collection.slug === testSlug, 'Created Collection with full seasonal festival fields');
    assert(collection.isActive === true && collection.isFeatured === true, 'Set isActive and isFeatured toggles');

    // 2. Create Normal Product linked to Collection
    console.log('\n--- Test 2: Festival Product Creation as Normal Product ---');
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'Festival Hampers', slug: `fest-cat-${Date.now()}` },
      });
    }

    const prodSku = `FEST-SKU-${Date.now()}`;
    const prodSlug = `fest-pack-${Date.now()}`;

    const festivalProduct = await prisma.product.create({
      data: {
        name: 'THALF Diwali Artisanal Pack',
        sku: prodSku,
        slug: prodSlug,
        description: 'Handcrafted dark chocolate pralines and slabs',
        price: 3450.00,
        status: 'ACTIVE',
        categoryId: category.id,
        weight: '650g',
        ingredients: '70% Dark Cacao, Roasted Almonds, Sea Salt',
        allergenInfo: 'Contains nuts and dairy',
        collections: {
          connect: [{ id: collection.id }],
        },
        inventory: {
          create: {
            stockQuantity: 25,
            reservedStock: 0,
          },
        },
      },
      include: {
        collections: true,
        inventory: true,
      },
    });

    assert(festivalProduct.sku === prodSku, 'Festival product created as standard Product model');
    assert(festivalProduct.collections.some(c => c.id === collection.id), 'Festival product connected to festival Collection via M:N');
    assert(festivalProduct.inventory.stockQuantity === 25, 'Festival product integrated with standard Inventory system');

    // 3. Active Festival Storefront Visibility Query
    console.log('\n--- Test 3: Seasonal Visibility Query Logic ---');
    const activeCollections = await prisma.collection.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      include: {
        products: {
          where: { status: 'ACTIVE', isDeleted: false },
        },
      },
    });

    assert(activeCollections.some(c => c.id === collection.id), 'Active collection matching current dates returns in active query');

    // 4. Test Future Date Hiding
    console.log('\n--- Test 4: Future Start Date Hiding ---');
    const futureCol = await prisma.collection.create({
      data: {
        name: 'Future Holi Special 2027',
        slug: `future-col-${Date.now()}`,
        startDate: new Date(now.getTime() + 86400000 * 10), // 10 days in future
        endDate: new Date(now.getTime() + 86400000 * 20),
        isActive: true,
      },
    });

    const activeCheckFuture = await prisma.collection.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
    });

    assert(!activeCheckFuture.some(c => c.id === futureCol.id), 'Future collection (startDate in future) correctly HIDDEN from storefront query');

    // 5. Test Expired Date Hiding
    console.log('\n--- Test 5: Expired End Date Hiding ---');
    const expiredCol = await prisma.collection.create({
      data: {
        name: 'Expired Rakhi Special 2025',
        slug: `expired-col-${Date.now()}`,
        startDate: new Date(now.getTime() - 86400000 * 30),
        endDate: new Date(now.getTime() - 86400000 * 2), // Ended 2 days ago
        isActive: true,
      },
    });

    const activeCheckExpired = await prisma.collection.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
    });

    assert(!activeCheckExpired.some(c => c.id === expiredCol.id), 'Expired collection (endDate in past) correctly HIDDEN from storefront query');
    assert(await prisma.collection.findUnique({ where: { id: expiredCol.id } }) !== null, 'Expired collection record is preserved (not deleted)');

    // 6. Test Active Toggle Manual Override
    console.log('\n--- Test 6: Manual Admin Deactivation Override ---');
    await prisma.collection.update({
      where: { id: collection.id },
      data: { isActive: false },
    });

    const activeCheckDeactivated = await prisma.collection.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
    });

    assert(!activeCheckDeactivated.some(c => c.id === collection.id), 'Deactivated collection (isActive=false) correctly HIDDEN from storefront query');

    // Clean up test items
    await prisma.product.delete({ where: { id: festivalProduct.id } });
    await prisma.collection.delete({ where: { id: collection.id } });
    await prisma.collection.delete({ where: { id: futureCol.id } });
    await prisma.collection.delete({ where: { id: expiredCol.id } });

    console.log(`\n==================================================`);
    console.log(`VERIFICATION COMPLETE: ${passed}/${total} items passed.`);
    console.log(`==================================================\n`);

    if (passed < total) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFestivalSpecialsTest();
