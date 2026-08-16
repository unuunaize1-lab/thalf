import { prisma } from '../src/lib/prisma';
import { productService } from '../src/services/product.service';
import { inventoryService } from '../src/services/inventory.service';
import { categoryService } from '../src/services/category.service';
import { collectionService } from '../src/services/collection.service';
import { orderService } from '../src/services/order.service';
import { productRepository } from '../src/repositories/product.repository';

async function runAcceptanceVerification() {
  console.log('\n==================================================');
  console.log('STARTING FINAL P1.3 ACCEPTANCE VERIFICATION');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`  [PASS] Item ${total}: ${description}`);
      passed++;
    } else {
      console.error(`  [FAIL] Item ${total}: ${description}`);
    }
  }

  try {
    // Helper: setup admin user & roles
    let superAdminRole = await prisma.role.findFirst({ where: { name: 'SUPER_ADMIN' } });
    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({ data: { name: 'SUPER_ADMIN' } });
    }
    let customerRole = await prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
    if (!customerRole) {
      customerRole = await prisma.role.create({ data: { name: 'CUSTOMER' } });
    }

    let adminUser = await prisma.user.findFirst({ where: { roleId: superAdminRole.id } });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: `admin-${Date.now()}@thalf.com`,
          name: 'Super Admin Tester',
          roleId: superAdminRole.id,
        },
      });
    }
    const adminActorId = adminUser.id;

    // SECTION 1: Category & Collection Operations
    console.log('--- Section: Category & Collection CRUD ---');
    const catSlug = `cat-accept-${Date.now()}`;
    const category = await categoryService.createCategory({
      name: 'Acceptance Category',
      slug: catSlug,
      description: 'Category for acceptance testing',
    });
    assert(category.slug === catSlug, 'Created Category with unique slug');

    const updatedCat = await categoryService.updateCategory(category.id, {
      name: 'Updated Acceptance Category',
    });
    assert(updatedCat.name === 'Updated Acceptance Category', 'Updated Category name');

    const colSlug = `col-accept-${Date.now()}`;
    const collection = await collectionService.createCollection({
      name: 'Acceptance Collection',
      slug: colSlug,
      description: 'Collection for acceptance testing',
    });
    assert(collection.slug === colSlug, 'Created Collection with unique slug');

    // SECTION 2: Product Validation & Guardrails
    console.log('\n--- Section: Product Validation Guardrails ---');
    const prodSku = `ACC-SKU-${Date.now()}`;
    const prodSlug = `acc-slug-${Date.now()}`;

    const draftProd = await productService.createProduct(
      {
        name: 'Acceptance Bar',
        sku: prodSku,
        slug: prodSlug,
        categoryId: category.id,
        collectionId: collection.id,
        description: 'Luxurious craft chocolate for audit',
        price: 2500,
        status: 'DRAFT',
        initialStock: 50,
      },
      adminActorId
    );
    assert(draftProd.sku === prodSku, 'Created draft product with initial stock 50');

    // Duplicate SKU
    try {
      await productService.createProduct(
        {
          name: 'Dup SKU Bar',
          sku: prodSku,
          slug: `diff-slug-${Date.now()}`,
          categoryId: category.id,
          description: 'Luxurious craft chocolate',
          price: 2500,
        },
        adminActorId
      );
      assert(false, 'Duplicate SKU should be rejected');
    } catch (e: any) {
      assert(e.message.includes('already exists'), 'Duplicate SKU rejected');
    }

    // Duplicate Slug
    try {
      await productService.createProduct(
        {
          name: 'Dup Slug Bar',
          sku: `DIFF-SKU-${Date.now()}`,
          slug: prodSlug,
          categoryId: category.id,
          description: 'Luxurious craft chocolate',
          price: 2500,
        },
        adminActorId
      );
      assert(false, 'Duplicate Slug should be rejected');
    } catch (e: any) {
      assert(e.message.includes('already exists'), 'Duplicate Slug rejected');
    }

    // Negative / Zero Price update for publishing
    try {
      await productService.updateProduct(draftProd.id, { price: -10 }, adminActorId);
      assert(false, 'Negative price update should fail validation');
    } catch (e: any) {
      assert(e.message.includes('Price must be greater than 0'), 'Negative price rejected');
    }

    // SECTION 3: Inventory Math & Ledger Logging
    console.log('\n--- Section: Inventory Math & Ledger ---');
    // Stock is 50. Add 20 -> 70
    const addRes = await inventoryService.adjustInventory({
      productId: draftProd.id,
      adjustment: 20,
      reason: 'RECEIPT_RESTOCK',
      note: 'Restock shipment',
      actorId: adminActorId,
    });
    assert(addRes.inventory.stockQuantity === 70, '50 + 20 = 70 stock quantity verified');
    assert(addRes.log.previousQuantity === 50 && addRes.log.newQuantity === 70, 'Ledger prev 50 -> new 70 recorded');

    // Subtract 5 -> 65
    const subRes = await inventoryService.adjustInventory({
      productId: draftProd.id,
      adjustment: -5,
      reason: 'DAMAGE_SPOILED',
      note: 'Spoiled packaging',
      actorId: adminActorId,
    });
    assert(subRes.inventory.stockQuantity === 65, '70 - 5 = 65 stock quantity verified');
    assert(subRes.log.previousQuantity === 70 && subRes.log.newQuantity === 65, 'Ledger prev 70 -> new 65 recorded');

    // Attempt subtraction of 100 (65 - 100) -> Should fail, stock remains 65
    try {
      await inventoryService.adjustInventory({
        productId: draftProd.id,
        adjustment: -100,
        reason: 'DAMAGE_SPOILED',
        actorId: adminActorId,
      });
      assert(false, 'Excessive reduction (65 - 100) should be rejected');
    } catch (e: any) {
      assert(e.message.includes('Negative inventory violation'), 'Excessive stock reduction rejected');
      const curInv = await prisma.inventory.findUnique({ where: { productId: draftProd.id } });
      assert(curInv?.stockQuantity === 65, 'Stock quantity remains intact at 65');
    }

    // SECTION 4: Concurrent Inventory Adjustments
    console.log('\n--- Section: Concurrent Inventory Adjustments ---');
    const pConcurrent = await productService.createProduct(
      {
        name: 'Concurrent Test Bar',
        sku: `CONC-SKU-${Date.now()}`,
        slug: `conc-slug-${Date.now()}`,
        categoryId: category.id,
        description: 'Concurrency test product',
        price: 1800,
        status: 'DRAFT',
        initialStock: 100,
      },
      adminActorId
    );

    // Fire 2 parallel stock adjustments (+10 and +15)
    await Promise.all([
      inventoryService.adjustInventory({
        productId: pConcurrent.id,
        adjustment: 10,
        reason: 'RECEIPT_RESTOCK',
        actorId: adminActorId,
      }),
      inventoryService.adjustInventory({
        productId: pConcurrent.id,
        adjustment: 15,
        reason: 'RECEIPT_RESTOCK',
        actorId: adminActorId,
      }),
    ]);

    const concInv = await prisma.inventory.findUnique({ where: { productId: pConcurrent.id } });
    assert(concInv?.stockQuantity === 125, 'Concurrent adjustments (100 + 10 + 15 = 125) correctly serialized without lost updates');

    // SECTION 5: Order Inventory Integration (Pending vs Confirmed vs Idempotency)
    console.log('\n--- Section: Order Inventory Integration ---');
    const activeProd = await productService.createProduct(
      {
        name: 'Order Test Bar',
        sku: `ORD-SKU-${Date.now()}`,
        slug: `ord-slug-${Date.now()}`,
        categoryId: category.id,
        description: 'Order integration test product',
        price: 2000,
        status: 'ACTIVE',
        initialStock: 40,
        images: [{ url: 'https://res.cloudinary.com/thalf/image/upload/sample.jpg', isDefault: true }],
      },
      adminActorId
    );

    // Create Order with PENDING status
    const createdRes = await orderService.createWhatsAppOrder({
      items: [{ productId: activeProd.id, quantity: 2 }],
      giftWrap: false,
      customerName: 'Jane Doe',
      phone: '+919876543210',
      street: '123 Cacao Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
    });

    const invAfterPending = await prisma.inventory.findUnique({ where: { productId: activeProd.id } });
    assert(invAfterPending?.stockQuantity === 40, 'Pending order creation does NOT deduct available stock (remains 40)');

    // Transition Order to CONFIRMED
    await orderService.confirmOrderAdmin(createdRes.orderId, adminActorId);

    const invAfterPaid = await prisma.inventory.findUnique({ where: { productId: activeProd.id } });
    assert(invAfterPaid?.stockQuantity === 38, 'Payment confirmation deducts stock exactly once (40 -> 38)');

    // Duplicate Payment Confirmation (Idempotency)
    await orderService.confirmOrderAdmin(createdRes.orderId, adminActorId);

    const invAfterDupPaid = await prisma.inventory.findUnique({ where: { productId: activeProd.id } });
    assert(invAfterDupPaid?.stockQuantity === 38, 'Duplicate payment confirmation is idempotent (stock remains 38)');

    // SECTION 6: Soft Delete & Storefront Visibility
    console.log('\n--- Section: Soft Delete & Visibility ---');
    await productService.deleteProduct(draftProd.id, adminActorId);
    const archivedRecord = await prisma.product.findUnique({ where: { id: draftProd.id } });
    assert(
      archivedRecord?.isDeleted === true && archivedRecord?.status === 'ARCHIVED',
      'Soft deleted product set to isDeleted=true and status=ARCHIVED'
    );

    const storefrontSearch = await productService.getProducts({ search: draftProd.sku });
    assert(storefrontSearch.data.length === 0, 'Archived product hidden from public catalog searches');

    // SECTION 7: Audit Logging
    console.log('\n--- Section: Audit Logging ---');
    const auditLogs = await prisma.auditLog.findMany({
      where: { entityId: draftProd.id },
    });
    assert(auditLogs.length >= 2, 'Audit logs recorded for product creation and deletion');
    assert(auditLogs.every(l => l.userId === adminActorId), 'Audit logs recorded authenticated admin actor identity');

    // SECTION 8: Category Deletion Protection with Products
    console.log('\n--- Section: Category Protection ---');
    try {
      await categoryService.deleteCategory(category.id);
      assert(false, 'Category with linked active products should prevent hard deletion');
    } catch (e: any) {
      assert(e.message.includes('Cannot delete category') || e.message.includes('products linked'), 'Category deletion prevented when active products are linked');
    }

    // SECTION 9: Collection Unassignment on Deletion
    console.log('\n--- Section: Collection Unassignment ---');
    await collectionService.deleteCollection(collection.id);
    const unassignedProd = await prisma.product.findUnique({ where: { id: activeProd.id }, include: { collections: true } });
    assert(unassignedProd?.collections.length === 0, 'Deleting collection unassigns linked products without deleting products');

    // SECTION 10: Placeholder Identification
    console.log('\n--- Section: Placeholder Identification ---');
    const isPlaceholder = (productService as any).constructor.isPlaceholderProduct('Venezuelan 80% Dark Slab', 'THALF-VEN-80');
    assert(isPlaceholder === true, 'Development placeholder product correctly identified by pattern');

    console.log(`\n==================================================`);
    console.log(`ACCEPTANCE VERIFICATION COMPLETE: ${passed}/${total} items passed.`);
    console.log(`==================================================\n`);

    if (passed < total) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Acceptance test failed with exception:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAcceptanceVerification();
