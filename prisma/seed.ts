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
  // 3. Mandatory Master Admin Account
  const superAdminRole = await prisma.role.findUnique({ where: { name: RoleType.SUPER_ADMIN } });
  if (superAdminRole) {
    const adminPhone = '+919876500000';
    const adminPassword = process.env.MASTER_ADMIN_PASSWORD || 'ThalfDev2026!';
    const adminEmail = process.env.MASTER_ADMIN_EMAIL || 'admin@thalf.store';
    
    // We import hashPassword dynamically or compute PBKDF2 hash
    const crypto = await import('node:crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(adminPassword, salt, 100000, 64, 'sha256').toString('hex');
    const hashedPassword = `$pbkdf2$sha256$v=1$i=100000$${salt}$${hash}`;

    await prisma.user.upsert({
      where: { phone: adminPhone },
      update: {
        passwordHash: hashedPassword,
        roleId: superAdminRole.id,
        isDeleted: false,
      },
      create: {
        email: adminEmail,
        name: 'THALF Master Administrator',
        phone: adminPhone,
        passwordHash: hashedPassword,
        roleId: superAdminRole.id,
      },
    });
    console.log(`✅ Master Admin Account ensured (${adminPhone})`);
  }

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
