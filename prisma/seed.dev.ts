import { PrismaClient, RoleType } from '@prisma/client';
import { hashPassword } from '../src/lib/auth-crypto';

const prisma = new PrismaClient();

/**
 * DEVELOPMENT PLACEHOLDER DATA ONLY
 * This seed script populates development environments with sample categories,
 * collections, products, and test inventory allocations for UI & API testing.
 * 
 * DO NOT RUN IN PRODUCTION.
 */
async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CAUTION: Cannot run development seed in production environment!');
  }

  console.log('🌱 Starting THALF Development Database Seed (Placeholder Data)...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: RoleType.ADMIN },
    update: {},
    create: { name: RoleType.ADMIN, permissions: ['*'] },
  });

  await prisma.role.upsert({
    where: { name: RoleType.SUPER_ADMIN },
    update: {},
    create: { name: RoleType.SUPER_ADMIN, permissions: ['*'] },
  });

  await prisma.role.upsert({
    where: { name: RoleType.CUSTOMER },
    update: {},
    create: { name: RoleType.CUSTOMER, permissions: ['read:profile', 'create:order'] },
  });

  await prisma.role.upsert({
    where: { name: RoleType.CONCIERGE },
    update: {},
    create: { name: RoleType.CONCIERGE, permissions: ['read:order', 'update:order'] },
  });

  // 2. Development Admin User
  const devAdminEmail = 'dev.admin@thalf.local';
  const hashedAdminPassword = hashPassword('ThalfDev2026!');
  
  await prisma.user.upsert({
    where: { email: devAdminEmail },
    update: {
      passwordHash: hashedAdminPassword,
      roleId: adminRole.id,
    },
    create: {
      email: devAdminEmail,
      name: 'THALF Dev Admin (Test Account)',
      phone: '+919876500000',
      passwordHash: hashedAdminPassword,
      roleId: adminRole.id,
    },
  });

  // 3. Placeholder Categories
  const categoryMap = new Map<string, string>();
  const categoryNames = [
    'Dark Chocolate',
    'Truffles & Pralines',
    'Single-Origin Bars',
  ];

  for (const catName of categoryNames) {
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cat = await prisma.category.upsert({
      where: { slug },
      update: { name: catName },
      create: {
        name: catName,
        slug,
        description: `[DEV PLACEHOLDER] ${catName} section for testing catalog rendering.`,
      },
    });
    categoryMap.set(catName, cat.id);
  }

  // 4. Placeholder Collections
  const collectionMap = new Map<string, string>();
  const collectionNames = ['Signature Reserve', 'Bespoke Atelier'];

  for (const colName of collectionNames) {
    const slug = colName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const col = await prisma.collection.upsert({
      where: { slug },
      update: { name: colName },
      create: {
        name: colName,
        slug,
        description: `[DEV PLACEHOLDER] ${colName} sample grouping for layout testing.`,
      },
    });
    collectionMap.set(colName, col.id);
  }

  // 5. Development Placeholder Products
  const DEV_PLACEHOLDER_PRODUCTS = [
    {
      id: 'thalf-001',
      name: 'Venezuelan Dark Chocolate Bar 80%',
      slug: 'venezuelan-dark-chocolate-bar-80',
      description: '[DEV PLACEHOLDER] Sample dark bar with plum and honey notes for catalog testing.',
      price: 1850,
      comparePrice: 2100,
      sku: 'THF-BAR-80V',
      cacaoPercentage: 80,
      tastingNotes: ['Dried Plum', 'Tobacco', 'Dark Honey'],
      category: 'Dark Chocolate',
      tags: ['Single Origin', 'Vegan'],
      images: [{ url: '/images/hero-chocolate.png', alt: 'Venezuelan Dark Chocolate Bar 80%', isDefault: true }],
    },
    {
      id: 'thalf-002',
      name: 'Royal Truffle & Praline Assortment',
      slug: 'royal-truffle-praline-assortment',
      description: '[DEV PLACEHOLDER] Handcrafted sample truffle box for checkout testing.',
      price: 3400,
      comparePrice: 3800,
      sku: 'THF-TRF-ROY',
      tastingNotes: ['Single Malt', 'Saffron', 'Roasted Hazelnut'],
      category: 'Truffles & Pralines',
      tags: ['Assortment', 'Handcrafted'],
      images: [{ url: '/images/hero-chocolate.png', alt: 'Royal Truffle & Praline Assortment', isDefault: true }],
    },
    {
      id: 'thalf-003',
      name: 'Ecuadorian Arriba Single-Origin 72%',
      slug: 'ecuadorian-arriba-single-origin-72',
      description: '[DEV PLACEHOLDER] Floral profile sample bar for search filter testing.',
      price: 1950,
      comparePrice: 2200,
      sku: 'THF-BAR-72E',
      cacaoPercentage: 72,
      tastingNotes: ['Wild Jasmine', 'Espresso Bean'],
      category: 'Single-Origin Bars',
      tags: ['Single Origin'],
      images: [{ url: '/images/hero-chocolate.png', alt: 'Ecuadorian Arriba Single-Origin 72%', isDefault: true }],
    },
    {
      id: 'thalf-005',
      name: 'Madagascar Sambirano Ruby 68%',
      slug: 'madagascar-sambirano-ruby-68',
      description: '[DEV PLACEHOLDER] Red fruit profile sample bar for category filter testing.',
      price: 1900,
      comparePrice: 2150,
      sku: 'THF-BAR-68M',
      cacaoPercentage: 68,
      tastingNotes: ['Red Currant', 'Citrus Zest'],
      category: 'Single-Origin Bars',
      tags: ['Single Origin'],
      images: [{ url: '/images/hero-chocolate.png', alt: 'Madagascar Sambirano Ruby 68%', isDefault: true }],
    },
    {
      id: 'thalf-006',
      name: 'Smoked Sea Salt Caramel Bonbons',
      slug: 'smoked-sea-salt-caramel-bonbons',
      description: '[DEV PLACEHOLDER] Sea salt bonbon sample for cart calculations.',
      price: 2800,
      comparePrice: 3100,
      sku: 'THF-BON-CAR',
      tastingNotes: ['Fleur de Sel', 'Butter Caramel'],
      category: 'Truffles & Pralines',
      tags: ['Bonbons', 'Caramel'],
      images: [{ url: '/images/hero-chocolate.png', alt: 'Smoked Sea Salt Caramel Bonbons', isDefault: true }],
    },
  ];

  for (const prod of DEV_PLACEHOLDER_PRODUCTS) {
    const categoryId = categoryMap.get(prod.category) || Array.from(categoryMap.values())[0];
    const collectionId = Array.from(collectionMap.values())[0];

    const createdProduct = await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description,
        price: prod.price,
        comparePrice: prod.comparePrice || null,
        status: 'ACTIVE',
        featured: true,
        tags: prod.tags || [],
        cacaoPercentage: prod.cacaoPercentage || null,
        tastingNotes: prod.tastingNotes || [],
        categoryId,
        ...(collectionId && { collections: { connect: [{ id: collectionId }] } }),
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        description: prod.description,
        price: prod.price,
        comparePrice: prod.comparePrice || null,
        status: 'ACTIVE',
        featured: true,
        tags: prod.tags || [],
        cacaoPercentage: prod.cacaoPercentage || null,
        tastingNotes: prod.tastingNotes || [],
        categoryId,
        ...(collectionId && { collections: { connect: [{ id: collectionId }] } }),
      },
    });

    // Seed Product Images
    if (prod.images && prod.images.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: createdProduct.id } });
      let idx = 0;
      for (const img of prod.images) {
        await prisma.productImage.create({
          data: {
            productId: createdProduct.id,
            url: img.url,
            alt: img.alt || prod.name,
            isDefault: img.isDefault || idx === 0,
            order: idx++,
          },
        });
      }
    }

    // Development Test Inventory Allocation (50 units)
    await prisma.inventory.upsert({
      where: { productId: createdProduct.id },
      update: { stockQuantity: 50, reservedStock: 0 },
      create: {
        productId: createdProduct.id,
        stockQuantity: 50,
        reservedStock: 0,
        reorderLevel: 5,
      },
    });
  }

  // 6. Settings
  const settings = [
    { key: 'whatsapp_number', value: '+919061107915', description: 'Business WhatsApp concierge phone number' },
    { key: 'whatsapp_display_name', value: 'THALF Artisanal Concierge', description: 'Display name for WhatsApp handoff' },
    { key: 'whatsapp_enabled', value: 'true', description: 'Enable or disable WhatsApp checkout channel' },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: { key: setting.key, value: setting.value, description: setting.description },
    });
  }

  console.log('✅ THALF Development Database Seed Completed (Placeholder Data Populated).');
}

main()
  .catch((e) => {
    console.error('❌ Development Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
