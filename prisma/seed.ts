import { PrismaClient, RoleType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * THALF Production Database Seed
 * Defines system essential roles, permission matrices, and required application settings.
 */
async function main() {
  console.log('🌱 Starting THALF Production Database Seed...');

  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_SEED === 'true') {
    throw new Error('CAUTION: Development sample data flag cannot be active in production!');
  }

  // 1. Mandatory System Roles & Permission Matrix
  const roles = [
    {
      name: RoleType.SUPER_ADMIN,
      permissions: ['*'],
    },
    {
      name: RoleType.ADMIN,
      permissions: [
        'orders.read',
        'orders.confirm',
        'orders.update',
        'orders.cancel',
        'payments.read',
        'payments.markPaid',
        'products.read',
        'products.create',
        'products.update',
        'products.archive',
        'inventory.read',
        'inventory.adjust',
        'customers.read',
        'settings.read',
        'settings.update',
        'audit.read',
        'roles.read',
      ],
    },
    {
      name: RoleType.CONCIERGE,
      permissions: [
        'orders.read',
        'orders.confirm',
        'orders.update',
        'products.read',
        'inventory.read',
        'customers.read',
      ],
    },
    {
      name: RoleType.CUSTOMER,
      permissions: [
        'profile.read',
        'profile.update',
        'orders.create_own',
        'orders.read_own',
      ],
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { permissions: role.permissions },
      create: { name: role.name, permissions: role.permissions },
    });
  }
  console.log('✅ System Roles & Permission Matrices seeded (SUPER_ADMIN, ADMIN, CONCIERGE, CUSTOMER)');

  // 2. Production Essential Settings
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
  console.log('✅ System Settings seeded');
  console.log('🔒 Production Seed Completed.');
}

main()
  .catch((e) => {
    console.error('❌ Production Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
