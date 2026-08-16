import { productService } from '../src/services/product.service';
import { productRepository } from '../src/repositories/product.repository';
import { inventoryService } from '../src/services/inventory.service';
import { categoryService } from '../src/services/category.service';
import { collectionService } from '../src/services/collection.service';
import { prisma } from '../src/lib/prisma';

async function runCatalogVerification() {
  console.log('\n==================================================');
  console.log('STARTING P1.3 PRODUCTION CATALOG & INVENTORY AUDIT');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`  [PASS] Assertion ${total}: ${description}`);
      passed++;
    } else {
      console.error(`  [FAIL] Assertion ${total}: ${description}`);
    }
  }

  try {
    // 1. Fetch default category & admin user for actorId
    const categories = await categoryService.getCategories();
    let testCategory: any = categories[0];
    if (!testCategory) {
      testCategory = await categoryService.createCategory({
        name: 'Test Audit Dark',
        slug: `test-audit-dark-${Date.now()}`,
        description: 'Temporary category for verification',
      });
    }

    let adminUser = await prisma.user.findFirst();
    if (!adminUser) {
      let role = await prisma.role.findFirst({ where: { name: 'SUPER_ADMIN' } });
      if (!role) {
        role = await prisma.role.create({
          data: {
            name: 'SUPER_ADMIN',
          },
        });
      }
      adminUser = await prisma.user.create({
        data: {
          email: `auditor-${Date.now()}@thalf.com`,
          name: 'System Auditor',
          roleId: role.id,
        },
      });
    }
    const actorId: string = adminUser.id;

    assert(!!testCategory.id, 'Prisma database has active Category records available');

    // 2. Duplicate SKU Check
    const uniqueSku = `AUDIT-SKU-${Date.now()}`;
    const uniqueSlug = `audit-slug-${Date.now()}`;

    const p1 = await productService.createProduct(
      {
        name: 'P1.3 Audit Bar 1',
        sku: uniqueSku,
        slug: uniqueSlug,
        categoryId: testCategory.id,
        description: 'Test artisanal dark bar for P1.3 verification.',
        price: 1500,
        status: 'DRAFT',
        initialStock: 10,
      },
      actorId
    );

    assert(p1.sku === uniqueSku, 'Created initial draft product with unique SKU');

    try {
      await productService.createProduct(
        {
          name: 'Duplicate SKU Bar',
          sku: uniqueSku, // Same SKU
          slug: `audit-slug-diff-${Date.now()}`,
          categoryId: testCategory.id,
          description: 'Test artisanal dark bar for P1.3 verification.',
          price: 1500,
          status: 'DRAFT',
        },
        actorId
      );
      assert(false, 'Duplicate SKU creation should throw error');
    } catch (err: any) {
      assert(
        err.message.includes('already exists'),
        `Duplicate SKU correctly rejected with message: "${err.message}"`
      );
    }

    // 3. Duplicate Slug Check
    try {
      await productService.createProduct(
        {
          name: 'Duplicate Slug Bar',
          sku: `AUDIT-SKU-DIFF-${Date.now()}`,
          slug: uniqueSlug, // Same slug
          categoryId: testCategory.id,
          description: 'Test artisanal dark bar for P1.3 verification.',
          price: 1500,
          status: 'DRAFT',
        },
        actorId
      );
      assert(false, 'Duplicate Slug creation should throw error');
    } catch (err: any) {
      assert(
        err.message.includes('already exists'),
        `Duplicate Slug correctly rejected with message: "${err.message}"`
      );
    }

    // 4. Server-Authoritative Publishing Guardrails
    try {
      await productService.updateProduct(
        p1.id,
        {
          status: 'ACTIVE',
          price: -50, // Invalid negative price for publishing
        },
        actorId
      );
      assert(false, 'Publishing product with invalid price should be rejected');
    } catch (err: any) {
      assert(
        err.message.includes('Publishing validation failed') || err.message.includes('Price must be greater than 0'),
        `Publishing guardrail enforced: "${err.message}"`
      );
    }

    // 5. Inventory Adjustment & Audit Ledger Logging
    const adjustResult = await inventoryService.adjustInventory({
      productId: p1.id,
      adjustment: 25,
      reason: 'RESTOCK_RECEIVED',
      note: 'Batch #804 shipment received from facility',
      actorId,
    });

    assert(
      adjustResult.inventory.stockQuantity === 35,
      `Stock correctly incremented from 10 to 35 (actual: ${adjustResult.inventory.stockQuantity})`
    );
    assert(
      adjustResult.log.reason === 'RESTOCK_RECEIVED',
      `InventoryLog ledger recorded reason '${adjustResult.log.reason}'`
    );

    // 6. Negative Stock Rejection
    try {
      await inventoryService.adjustInventory({
        productId: p1.id,
        adjustment: -100, // Excessive reduction
        reason: 'DAMAGE_SPOILED',
        actorId,
      });
      assert(false, 'Negative inventory adjustment should be rejected');
    } catch (err: any) {
      assert(
        err.message.includes('Negative inventory violation') || err.message.includes('cannot be negative'),
        `Negative inventory attempt safely blocked: "${err.message}"`
      );
    }

    // 7. Controlled Archival Policy
    await productService.deleteProduct(p1.id, actorId);
    const archivedP1 = await prisma.product.findUnique({ where: { id: p1.id } });
    assert(
      archivedP1?.isDeleted === true && archivedP1?.status === 'ARCHIVED',
      'Product marked as isDeleted=true and status=ARCHIVED on deletion'
    );

    // Clean up test category if created
    if (testCategory.name === 'Test Audit Dark') {
      try {
        await categoryService.deleteCategory(testCategory.id);
        assert(true, 'Cleaned up temporary test category');
      } catch (err) {
        // category might have lingering items
      }
    }

    console.log(`\n==================================================`);
    console.log(`P1.3 AUDIT SUMMARY: ${passed}/${total} assertions passed.`);
    console.log(`==================================================\n`);

    if (passed < total) {
      process.exit(1);
    }
  } catch (globalErr: any) {
    console.error('P1.3 Verification test error:', globalErr);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runCatalogVerification();
