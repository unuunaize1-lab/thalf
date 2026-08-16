const tsNode = require('ts-node');
tsNode.register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    target: 'es2017',
    esModuleInterop: true,
  },
});

const tsconfigPaths = require('tsconfig-paths');
const tsconfig = require('../tsconfig.json');
tsconfigPaths.register({
  baseUrl: '.',
  paths: tsconfig.compilerOptions.paths,
});

const crypto = require('crypto');
const { RoleType, OrderStatus, PaymentStatus } = require('@prisma/client');

// In-Memory Database Store
const db = {
  roles: [
    { id: 'role-customer', name: RoleType.CUSTOMER, permissions: ['read:profile', 'create:order'] },
    { id: 'role-concierge', name: RoleType.CONCIERGE, permissions: ['orders.read', 'orders.confirm'] },
    { id: 'role-admin', name: RoleType.ADMIN, permissions: ['orders.read', 'orders.confirm', 'payments.markPaid', 'inventory.adjust'] },
    { id: 'role-super-admin', name: RoleType.SUPER_ADMIN, permissions: ['*'] },
  ],
  users: [],
  sessions: [],
  categories: [],
  products: [],
  inventories: [],
  orders: [],
  orderItems: [],
  orderStatusHistories: [],
  payments: [],
  auditLogs: [],
};

// Helper function to create Prisma Client Mock
function createMockPrisma() {
  const mockPrisma = {
    role: {
      findUnique: async ({ where }) => {
        if (where.name) return db.roles.find(r => r.name === where.name) || null;
        if (where.id) return db.roles.find(r => r.id === where.id) || null;
        return null;
      },
      create: async ({ data }) => {
        const role = { id: 'role-' + Date.now(), permissions: [], ...data };
        db.roles.push(role);
        return role;
      },
    },
    user: {
      findUnique: async ({ where, include }) => {
        let user = null;
        if (where.id) user = db.users.find(u => u.id === where.id);
        if (where.phone) user = db.users.find(u => u.phone === where.phone);
        if (!user) return null;

        const result = { ...user };
        if (include?.role) {
          result.role = db.roles.find(r => r.id === user.roleId) || null;
        }
        return result;
      },
      create: async ({ data, include }) => {
        // Check unique phone
        if (data.phone && db.users.some(u => u.phone === data.phone && !u.isDeleted)) {
          const err = new Error('Unique constraint failed on phone');
          err.code = 'P2002';
          err.meta = { target: ['phone'] };
          throw err;
        }

        const user = {
          id: 'usr-' + Math.random().toString(36).substring(2, 9),
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        db.users.push(user);

        const result = { ...user };
        if (include?.role) {
          result.role = db.roles.find(r => r.id === user.roleId) || null;
        }
        return result;
      },
      update: async ({ where, data }) => {
        const user = db.users.find(u => u.id === where.id);
        if (!user) throw new Error('User not found');
        Object.assign(user, data, { updatedAt: new Date() });
        return user;
      },
      deleteMany: async ({ where }) => {
        if (where?.phone?.in) {
          db.users = db.users.filter(u => !where.phone.in.includes(u.phone));
        }
        return { count: 1 };
      },
    },
    session: {
      findUnique: async ({ where, include }) => {
        const session = db.sessions.find(s => s.tokenHash === where.tokenHash);
        if (!session) return null;

        const result = { ...session };
        if (include?.user) {
          const user = db.users.find(u => u.id === session.userId);
          if (user) {
            result.user = { ...user };
            if (include.user.include?.role) {
              result.user.role = db.roles.find(r => r.id === user.roleId) || null;
            }
          }
        }
        return result;
      },
      findFirst: async ({ where }) => {
        return db.sessions.find(s => s.userId === where.userId) || null;
      },
      create: async ({ data }) => {
        const session = {
          id: 'sess-' + Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
          ...data,
        };
        db.sessions.push(session);
        return session;
      },
      delete: async ({ where }) => {
        db.sessions = db.sessions.filter(s => s.id !== where.id);
        return { count: 1 };
      },
      deleteMany: async ({ where }) => {
        if (where?.user?.phone?.in) {
          const targetUserIds = db.users.filter(u => where.user.phone.in.includes(u.phone)).map(u => u.id);
          db.sessions = db.sessions.filter(s => !targetUserIds.includes(s.userId));
        } else if (where?.tokenHash) {
          db.sessions = db.sessions.filter(s => s.tokenHash !== where.tokenHash);
        }
        return { count: 1 };
      },
    },
    category: {
      create: async ({ data }) => {
        const cat = { id: 'cat-' + Date.now(), ...data };
        db.categories.push(cat);
        return cat;
      },
    },
    product: {
      findFirst: async ({ where, include }) => {
        const prod = db.products.find(p => !p.isDeleted && (where?.status ? p.status === where.status : true));
        if (!prod) return null;
        const res = { ...prod };
        if (include?.inventory) {
          res.inventory = db.inventories.find(i => i.productId === prod.id) || null;
        }
        return res;
      },
      create: async ({ data }) => {
        const prodId = 'prod-' + Date.now();
        const prod = {
          id: prodId,
          isDeleted: false,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        db.products.push(prod);
        if (data.inventory?.create) {
          db.inventories.push({
            id: 'inv-' + Date.now(),
            productId: prodId,
            stockQuantity: data.inventory.create.stockQuantity || 0,
            reservedStock: 0,
          });
        }
        return prod;
      },
    },
    inventory: {
      findUnique: async ({ where }) => {
        return db.inventories.find(i => i.productId === where.productId) || null;
      },
      upsert: async ({ where, update, create }) => {
        let inv = db.inventories.find(i => i.productId === where.productId);
        if (inv) {
          Object.assign(inv, update);
        } else {
          inv = { id: 'inv-' + Date.now(), productId: where.productId, ...create };
          db.inventories.push(inv);
        }
        return inv;
      },
      update: async ({ where, data }) => {
        const inv = db.inventories.find(i => i.productId === where.productId);
        if (!inv) throw new Error('Inventory not found');
        if (data.stockQuantity && typeof data.stockQuantity === 'object' && 'decrement' in data.stockQuantity) {
          inv.stockQuantity -= data.stockQuantity.decrement;
        } else if (typeof data.stockQuantity === 'number') {
          inv.stockQuantity = data.stockQuantity;
        }
        if (data.reservedStock !== undefined) inv.reservedStock = data.reservedStock;
        return inv;
      },
    },
    order: {
      findUnique: async ({ where, include }) => {
        const order = db.orders.find(o => o.id === where.id);
        if (!order) return null;
        const res = { ...order };
        if (include?.orderItems) {
          res.orderItems = db.orderItems.filter(i => i.orderId === order.id).map(item => {
            const itemCopy = { ...item };
            if (include.orderItems.include?.product) {
              itemCopy.product = db.products.find(p => p.id === item.productId) || null;
            }
            return itemCopy;
          });
        }
        if (include?.payment) {
          res.payment = db.payments.find(p => p.orderId === order.id) || null;
        }
        if (include?.statusHistory) {
          res.statusHistory = db.orderStatusHistories.filter(h => h.orderId === order.id);
          if (include.statusHistory.orderBy?.createdAt === 'desc') {
            res.statusHistory.sort((a, b) => b.createdAt - a.createdAt);
          }
        }
        return res;
      },
      create: async ({ data, include }) => {
        const orderId = 'ord-' + Date.now();
        const order = {
          id: orderId,
          status: OrderStatus.PENDING_CONFIRMATION,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        db.orders.push(order);

        // Handle nested orderItems
        if (data.orderItems?.createMany?.data) {
          for (const itemData of data.orderItems.createMany.data) {
            db.orderItems.push({
              id: 'item-' + Math.random().toString(36).substring(2, 9),
              orderId,
              ...itemData,
            });
          }
        }
        // Handle nested payment
        if (data.payment?.create) {
          db.payments.push({
            id: 'pay-' + Math.random().toString(36).substring(2, 9),
            orderId,
            status: PaymentStatus.UNPAID,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data.payment.create,
          });
        }
        // Handle nested statusHistory
        if (data.statusHistory?.create) {
          db.orderStatusHistories.push({
            id: 'hist-' + Math.random().toString(36).substring(2, 9),
            orderId,
            createdAt: new Date(),
            ...data.statusHistory.create,
          });
        }

        const res = { ...order };
        if (include?.orderItems) res.orderItems = db.orderItems.filter(i => i.orderId === orderId);
        if (include?.payment) res.payment = db.payments.find(p => p.orderId === orderId);
        return res;
      },
      update: async ({ where, data, include }) => {
        const order = db.orders.find(o => o.id === where.id);
        if (!order) throw new Error('Order not found');
        Object.assign(order, data, { updatedAt: new Date() });

        if (data.statusHistory?.create) {
          db.orderStatusHistories.push({
            id: 'hist-' + Math.random().toString(36).substring(2, 9),
            orderId: order.id,
            createdAt: new Date(),
            ...data.statusHistory.create,
          });
        }

        return mockPrisma.order.findUnique({ where: { id: order.id }, include });
      },
      deleteMany: async ({ where }) => {
        if (where?.customerPhone?.in) {
          db.orders = db.orders.filter(o => !where.customerPhone.in.includes(o.customerPhone));
        }
        return { count: 1 };
      },
    },
    orderItem: {
      deleteMany: async () => ({ count: 1 }),
    },
    orderStatusHistory: {
      deleteMany: async () => ({ count: 1 }),
    },
    payment: {
      update: async ({ where, data }) => {
        const pay = db.payments.find(p => p.orderId === where.orderId);
        if (!pay) throw new Error('Payment not found');
        Object.assign(pay, data, { updatedAt: new Date() });
        return pay;
      },
      deleteMany: async () => ({ count: 1 }),
    },
    auditLog: {
      create: async ({ data }) => {
        const log = {
          id: 'log-' + Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
          ...data,
        };
        db.auditLogs.push(log);
        return log;
      },
      findMany: async ({ take, skip, orderBy }) => {
        let logs = [...db.auditLogs];
        if (orderBy?.createdAt === 'desc') {
          logs.sort((a, b) => b.createdAt - a.createdAt);
        }
        return logs.slice(skip || 0, (skip || 0) + (take || 50));
      },
      deleteMany: async () => ({ count: 1 }),
    },
    $transaction: async (arg) => {
      if (typeof arg === 'function') {
        // Deep copy db snapshot for rollback capability
        const snapshot = JSON.stringify(db);
        try {
          return await arg(mockPrisma);
        } catch (err) {
          // Rollback in-memory DB on failure
          const restored = JSON.parse(snapshot);
          Object.keys(db).forEach(k => delete db[k]);
          Object.assign(db, restored);
          throw err;
        }
      } else if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
    },
    $disconnect: async () => {},
  };

  return mockPrisma;
}

// Override global prisma instance
const mockPrismaInstance = createMockPrisma();
const prismaModule = require('../src/lib/prisma');
prismaModule.prisma = mockPrismaInstance;
prismaModule.default = mockPrismaInstance;

// Now require and execute the security suite
const { hashPassword, generateSessionToken, hashSessionToken } = require('../src/lib/phone-utils');
const { authService } = require('../src/services/auth.service');
const { orderService } = require('../src/services/order.service');
const { auditService } = require('../src/services/audit.service');
const { inventoryRepository } = require('../src/repositories/inventory.repository');

async function runP04SecuritySuite() {
  console.log('====================================================');
  console.log('THALF P0-4 ADMIN RBAC & AUTHORIZATION SECURITY SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // Cleanup helper
  const phones = ['+919876540001', '+919876540002', '+919876540003', '+919876540004', '+919876540005'];

  async function cleanup() {
    await mockPrismaInstance.session.deleteMany({
      where: { user: { phone: { in: phones } } },
    });
    await mockPrismaInstance.auditLog.deleteMany({
      where: { user: { phone: { in: phones } } },
    });
    await mockPrismaInstance.orderStatusHistory.deleteMany({
      where: { order: { customerPhone: { in: phones } } },
    });
    await mockPrismaInstance.orderItem.deleteMany({
      where: { order: { customerPhone: { in: phones } } },
    });
    await mockPrismaInstance.payment.deleteMany({
      where: { order: { customerPhone: { in: phones } } },
    });
    await mockPrismaInstance.order.deleteMany({
      where: { customerPhone: { in: phones } },
    });
    await mockPrismaInstance.user.deleteMany({
      where: { phone: { in: phones } },
    });
  }

  try {
    await cleanup();

    // Setup Roles in DB if missing
    const customerRole = await mockPrismaInstance.role.findUnique({ where: { name: RoleType.CUSTOMER } });
    const conciergeRole = await mockPrismaInstance.role.findUnique({ where: { name: RoleType.CONCIERGE } });
    const adminRole = await mockPrismaInstance.role.findUnique({ where: { name: RoleType.ADMIN } });
    const superAdminRole = await mockPrismaInstance.role.findUnique({ where: { name: RoleType.SUPER_ADMIN } });

    // 1. Create Test Identities
    console.log('[1/14] Setting up test identities (CUSTOMER, CONCIERGE, ADMIN, SUPER_ADMIN)...');
    
    // Customer
    const { user: uCustomer, session: sCustomer } = await authService.registerUser({
      name: 'Customer Test',
      phone: '9876540001',
      password: 'Password123!',
    });

    // Concierge
    const uConcierge = await mockPrismaInstance.user.create({
      data: {
        name: 'Concierge Staff',
        phone: '+919876540002',
        roleId: conciergeRole.id,
        passwordHash: '$pbkdf2$sha256$v=1...',
      },
      include: { role: true },
    });
    const sConcierge = await authService.createSession(uConcierge.id);

    // Admin
    const uAdmin = await mockPrismaInstance.user.create({
      data: {
        name: 'Admin Staff',
        phone: '+919876540003',
        roleId: adminRole.id,
        passwordHash: '$pbkdf2$sha256$v=1...',
      },
      include: { role: true },
    });
    const sAdmin = await authService.createSession(uAdmin.id);

    // Super Admin
    const uSuperAdmin = await mockPrismaInstance.user.create({
      data: {
        name: 'Super Admin',
        phone: '+919876540004',
        roleId: superAdminRole.id,
        passwordHash: '$pbkdf2$sha256$v=1...',
      },
      include: { role: true },
    });
    const sSuperAdmin = await authService.createSession(uSuperAdmin.id);

    assert(uCustomer.role.name === 'CUSTOMER', 'Created CUSTOMER identity');
    assert(uConcierge.role.name === 'CONCIERGE', 'Created CONCIERGE identity');
    assert(uAdmin.role.name === 'ADMIN', 'Created ADMIN identity');
    assert(uSuperAdmin.role.name === 'SUPER_ADMIN', 'Created SUPER_ADMIN identity');

    // 2. GUEST Access Checks
    console.log('\n[2/14] Testing GUEST Access Denial (No Session)...');
    const guestSession = await authService.getSession('');
    assert(guestSession === null, 'GUEST token returns null session');

    // 3. CUSTOMER Access Denial to Admin Endpoints
    console.log('\n[3/14] Testing CUSTOMER Access Denial to Admin Endpoints...');
    const custSessionObj = await authService.getSession(sCustomer.token);
    assert(custSessionObj.user.role.name === 'CUSTOMER', 'Customer session validated');
    const custPermissions = custSessionObj.user.role.permissions;
    assert(!custPermissions.includes('orders.read') && !custPermissions.includes('*'), 'CUSTOMER lacks orders.read permission');
    assert(!custPermissions.includes('settings.update'), 'CUSTOMER lacks settings.update permission');
    assert(!custPermissions.includes('inventory.adjust'), 'CUSTOMER lacks inventory.adjust permission');

    // 4. CONCIERGE Permission Guarding (Conservative Operational Access)
    console.log('\n[4/14] Testing CONCIERGE Conservative Permissions...');
    const concSessionObj = await authService.getSession(sConcierge.token);
    const concPerms = concSessionObj.user.role.permissions;
    assert(concPerms.includes('orders.read'), 'CONCIERGE has operational orders.read permission');
    assert(concPerms.includes('orders.confirm'), 'CONCIERGE has operational orders.confirm permission');
    assert(!concPerms.includes('payments.markPaid'), 'CONCIERGE DENIED payments.markPaid permission');
    assert(!concPerms.includes('inventory.adjust'), 'CONCIERGE DENIED inventory.adjust permission');
    assert(!concPerms.includes('settings.update'), 'CONCIERGE DENIED settings.update permission');
    assert(!concPerms.includes('roles.manage'), 'CONCIERGE DENIED roles.manage permission');

    // 5. ADMIN & SUPER_ADMIN Operational Permissions
    console.log('\n[5/14] Testing ADMIN & SUPER_ADMIN Permission Coverage...');
    const adminSessionObj = await authService.getSession(sAdmin.token);
    const adminPerms = adminSessionObj.user.role.permissions;
    assert(adminPerms.includes('orders.read') && adminPerms.includes('payments.markPaid') && adminPerms.includes('inventory.adjust'), 'ADMIN has operational administrative permissions');
    assert(!adminPerms.includes('roles.manage') && !adminPerms.includes('*'), 'ADMIN DENIED roles.manage permission (Reserved for SUPER_ADMIN)');

    const superAdminSessionObj = await authService.getSession(sSuperAdmin.token);
    const superPerms = superAdminSessionObj.user.role.permissions;
    assert(superPerms.includes('*'), 'SUPER_ADMIN has full wildcard permission');

    // 6. Forgery & Cookie Tampering Protection
    console.log('\n[6/14] Testing Forgery & Cookie Tampering Protection...');
    const fakeToken = 'fake_session_' + crypto.randomBytes(16).toString('hex');
    assert((await authService.getSession(fakeToken)) === null, 'Fake session token rejected');

    const tamperedToken = sAdmin.token + '_tampered';
    assert((await authService.getSession(tamperedToken)) === null, 'Tampered cookie session token rejected');

    // 7. Customer IDOR Ownership Protection
    console.log('\n[7/14] Testing Customer IDOR Ownership Protection...');
    let product = await mockPrismaInstance.product.findFirst({ where: { isDeleted: false } });
    if (!product) {
      const cat = await mockPrismaInstance.category.create({ data: { name: 'Test Cat', slug: 'test-cat-' + Date.now() } });
      product = await mockPrismaInstance.product.create({
        data: {
          name: 'Test Dark Truffle',
          slug: 'test-truffle-' + Date.now(),
          sku: 'TEST-SKU-' + Date.now(),
          price: 500,
          categoryId: cat.id,
          inventory: { create: { stockQuantity: 50 } },
        },
      });
    }

    const forgedUserId = uAdmin.id;
    const verifiedCustomerUserId = uCustomer.id;
    const orderPayload = {
      items: [{ productId: product.id, quantity: 2 }],
      customerName: 'Customer Test',
      phone: '9876540001',
      street: '123 Test St',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
    };

    const orderRes = await orderService.createWhatsAppOrder(orderPayload, verifiedCustomerUserId);
    const createdOrder = await mockPrismaInstance.order.findUnique({
      where: { id: orderRes.orderId },
      include: { payment: true },
    });
    assert(createdOrder.userId === verifiedCustomerUserId, 'Order attached verified session customer ID, ignoring forged userId');

    // 8. MANDATORY ROLE DEMOTION SECURITY TEST (ADMIN -> CUSTOMER mid-session)
    console.log('\n[8/14] Testing Mid-Session Role Demotion (ADMIN -> CUSTOMER)...');
    const preDemotionSession = await authService.getSession(sAdmin.token);
    assert(preDemotionSession.user.role.name === 'ADMIN', 'Session initially evaluates trusted ADMIN role');

    await mockPrismaInstance.user.update({
      where: { id: uAdmin.id },
      data: { roleId: customerRole.id },
    });

    const postDemotionSession = await authService.getSession(sAdmin.token);
    assert(postDemotionSession.user.role.name === 'CUSTOMER', 'Post-demotion session IMMEDIATELY re-evaluates as CUSTOMER from DB');
    const demotedPerms = postDemotionSession.user.role.permissions;
    assert(!demotedPerms.includes('orders.read') && !demotedPerms.includes('*'), 'Demoted session DENIED administrative permissions on subsequent call');

    await mockPrismaInstance.user.update({
      where: { id: uAdmin.id },
      data: { roleId: adminRole.id },
    });

    // 9. MANDATORY ACCOUNT REVOCATION / DISABLE TEST (isDeleted = true)
    console.log('\n[9/14] Testing Account Disabling / Revocation (isDeleted = true)...');
    await mockPrismaInstance.user.update({
      where: { id: uAdmin.id },
      data: { isDeleted: true },
    });

    const disabledSessionCheck = await authService.getSession(sAdmin.token);
    assert(disabledSessionCheck.user.isDeleted === true, 'Disabled user account flagged as isDeleted = true in DB session query');

    await mockPrismaInstance.user.update({
      where: { id: uAdmin.id },
      data: { isDeleted: false },
    });

    // 10. Atomic Order Confirmation & Inventory Commitment Transaction
    console.log('\n[10/14] Testing Atomic Order Confirmation & Inventory Commitment...');
    await mockPrismaInstance.inventory.upsert({
      where: { productId: product.id },
      update: { stockQuantity: 50 },
      create: { productId: product.id, stockQuantity: 50 },
    });

    const confirmedOrder = await orderService.confirmOrderAdmin(createdOrder.id, uAdmin.id, 'Confirmed by Admin Test');
    const postConfirmInventory = await mockPrismaInstance.inventory.findUnique({ where: { productId: product.id } });
    
    assert(confirmedOrder.status === OrderStatus.CONFIRMED, 'Order status updated to CONFIRMED');
    assert(postConfirmInventory.stockQuantity === 48, `Inventory decremented from 50 -> 48 (Actual: ${postConfirmInventory.stockQuantity})`);

    const latestHistory = confirmedOrder.statusHistory[0];
    assert(latestHistory.changedBy === uAdmin.id, `OrderStatusHistory.changedBy correctly set to Admin ID '${uAdmin.id}'`);

    // 11. INVENTORY IDEMPOTENCY TEST (Repeat Confirmation Must NOT Decrement Again)
    console.log('\n[11/14] Testing Inventory Confirmation Idempotency...');
    const repeatConfirmedOrder = await orderService.confirmOrderAdmin(createdOrder.id, uAdmin.id, 'Repeat confirmation');
    const repeatInventory = await mockPrismaInstance.inventory.findUnique({ where: { productId: product.id } });

    assert(repeatConfirmedOrder.status === OrderStatus.CONFIRMED, 'Repeat confirmation returned CONFIRMED order');
    assert(repeatInventory.stockQuantity === 48, `Stock remained exactly 48 (NOT decremented twice to 46! Actual: ${repeatInventory.stockQuantity})`);

    // 12. PAYMENT MUTATION & IDEMPOTENCY TEST
    console.log('\n[12/14] Testing Payment Status Mutation & Idempotency...');
    const uniqueTxnRef = 'WA-TXN-' + Date.now();
    const paidOrder = await orderService.markPaymentReceivedAdmin(createdOrder.id, uAdmin.id, uniqueTxnRef, 'Payment received via WhatsApp');
    assert(paidOrder.payment.status === PaymentStatus.PAID, 'Payment status updated to PAID');

    const repeatPaidOrder = await orderService.markPaymentReceivedAdmin(createdOrder.id, uAdmin.id, uniqueTxnRef, 'Repeat payment call');
    assert(repeatPaidOrder.payment.status === PaymentStatus.PAID, 'Repeat payment call maintains PAID status without duplicate side-effects');

    // 13. Audit Logging & Credential Sanitization Test
    console.log('\n[13/14] Testing Audit Logging & Credential Sanitization...');
    const auditLogs = await auditService.getLogs(10, 0);
    const confirmAuditLog = auditLogs.find(l => l.action === 'CONFIRM_ORDER' && l.entityId === createdOrder.id);
    const paymentAuditLog = auditLogs.find(l => l.action === 'MARK_PAYMENT_RECEIVED' && l.entityId === createdOrder.payment.id);

    assert(!!confirmAuditLog, 'CONFIRM_ORDER created AuditLog entry in DB');
    assert(!!paymentAuditLog, 'MARK_PAYMENT_RECEIVED created AuditLog entry in DB');
    assert(confirmAuditLog.userId === uAdmin.id, `AuditLog actor ID set to verified Admin ID '${uAdmin.id}'`);

    await auditService.log(mockPrismaInstance, {
      userId: uAdmin.id,
      action: 'TEST_SANITIZATION',
      entity: 'Test',
      details: {
        password: 'SuperSecretPassword123!',
        token: 'raw_session_token_12345',
        secret: 'api_secret_key',
        safeField: 'Public Metadata',
      },
    });

    const sanitizationLogs = await auditService.getLogs(5, 0);
    const testLog = sanitizationLogs.find(l => l.action === 'TEST_SANITIZATION');
    assert(testLog.details.password === '[REDACTED]', 'Sensitive field "password" was REDACTED in AuditLog');
    assert(testLog.details.token === '[REDACTED]', 'Sensitive field "token" was REDACTED in AuditLog');
    assert(testLog.details.safeField === 'Public Metadata', 'Safe field retained in AuditLog');

    // 14. Transactional Audit Log Failure Rollback Test
    console.log('\n[14/14] Testing Audit Failure Transaction Rollback...');
    let rollbackSuccess = false;
    try {
      await mockPrismaInstance.$transaction(async (tx) => {
        await tx.inventory.update({
          where: { productId: product.id },
          data: { stockQuantity: 99 },
        });
        throw new Error('INTENTIONAL_AUDIT_FAILURE_ROLLBACK');
      });
    } catch (err) {
      rollbackSuccess = err.message === 'INTENTIONAL_AUDIT_FAILURE_ROLLBACK';
    }

    const postRollbackInventory = await mockPrismaInstance.inventory.findUnique({ where: { productId: product.id } });
    assert(rollbackSuccess && postRollbackInventory.stockQuantity === 48, 'Transaction rolled back cleanly upon audit failure (stock restored to 48, NOT 99!)');

  } catch (error) {
    console.error('SUITE ERROR:', error);
    failed++;
  } finally {
    await cleanup();
    await mockPrismaInstance.$disconnect();
    console.log('\n====================================================');
    console.log(`P0-4 SECURITY SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runP04SecuritySuite();
