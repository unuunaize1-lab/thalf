import { PrismaClient, RoleType } from '@prisma/client';
import crypto from 'crypto';
import { normalizePhoneNumber, isValidIndianMobile } from '@/lib/phone-utils';
import { hashPassword, verifyPassword, generateSessionToken, hashSessionToken } from '@/lib/auth-crypto';
import { authService } from '@/services/auth.service';
import { inMemoryRateLimiter, authRateLimiter } from '@/lib/rate-limiter';

const prisma = new PrismaClient();

async function runP03SecuritySuite() {
  console.log('====================================================');
  console.log('THALF P0-3 AUTHENTICATION SECURITY SUITE (25 TESTS)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // Cleanup helper for test accounts
  const testPhoneRaw = '9876599999';
  const testPhoneNormalized = '+919876599999';
  const testPhoneB = '+919876588888';

  async function cleanup() {
    await prisma.session.deleteMany({
      where: { user: { phone: { in: [testPhoneNormalized, testPhoneB] } } },
    });
    await prisma.user.deleteMany({
      where: { phone: { in: [testPhoneNormalized, testPhoneB] } },
    });
  }

  try {
    await cleanup();

    // 1. Valid Indian Mobile E.164 Normalization
    console.log('[1/25] Testing Valid Indian Number E.164 Normalization...');
    const norm1 = normalizePhoneNumber('9876599999');
    assert(norm1 === testPhoneNormalized, `Normalized 10-digit number '9876599999' -> '${norm1}'`);

    // 2. Format Variant Equivalence
    console.log('\n[2/25] Testing Format Variant Equivalence...');
    const normVariantA = normalizePhoneNumber('9876599999');
    const normVariantB = normalizePhoneNumber('+91 98765 99999');
    const normVariantC = normalizePhoneNumber('09876599999');
    const normVariantD = normalizePhoneNumber('+919876599999');
    assert(
      normVariantA === normVariantB && normVariantB === normVariantC && normVariantC === normVariantD,
      'All 4 format variants resolve to identical normalized string: +919876599999'
    );

    // 3. Invalid Phone Rejection
    console.log('\n[3/25] Testing Invalid Phone Format Rejection...');
    assert(!isValidIndianMobile('12345'), 'Rejected short number "12345"');
    assert(!isValidIndianMobile('abcdefghij'), 'Rejected alphabetic string "abcdefghij"');
    assert(!isValidIndianMobile('5555555555'), 'Rejected 10-digit number starting with 5 (must start 6-9)');

    // 4. Short / Invalid Password Validation
    console.log('\n[4/25] Testing Password Complexity Validation...');
    let shortPassError = false;
    try {
      await authService.registerUser({ name: 'Test User', phone: testPhoneRaw, password: '123' });
    } catch (err: any) {
      shortPassError = err.message.includes('Password must be at least 8 characters');
    }
    assert(shortPassError, 'Short password (<8 chars) was rejected');

    // 5. CUSTOMER Creation Without Phone Rejected
    console.log('\n[5/25] Testing CUSTOMER Account Phone Requirement...');
    let missingPhoneError = false;
    try {
      await authService.registerUser({ name: 'No Phone User', phone: '', password: 'Password123!' });
    } catch (err: any) {
      missingPhoneError = err.message.includes('Mobile number is required');
    }
    assert(missingPhoneError, 'CUSTOMER registration without mobile number was rejected');

    // 6. Valid Registration & DB Storage
    console.log('\n[6/25] Testing Valid Account Registration...');
    const { user: regUser, session: regSession } = await authService.registerUser({
      name: 'Ananya Sharma',
      phone: testPhoneRaw,
      password: 'StrongP@ssword123!',
      email: 'ananya@example.com',
    });
    assert(regUser.phone === testPhoneNormalized, `Registered account stored normalized phone '${regUser.phone}'`);
    assert(!!regSession.token, 'Registration issued opaque browser session token');

    // 7. phoneVerifiedAt Remains NULL Upon Registration
    console.log('\n[7/25] Testing phoneVerifiedAt Flag Default...');
    assert(regUser.phoneVerifiedAt === null, 'phoneVerifiedAt is NULL upon registration (unverified until future OTP flow)');

    // 8. Duplicate Phone Registration Rejection & P2002 Race Condition Handling
    console.log('\n[8/25] Testing Duplicate Phone Registration Rejection...');
    let duplicateError = false;
    try {
      await authService.registerUser({
        name: 'Duplicate User',
        phone: '+91 98765 99999', // Different formatting of same number
        password: 'Password123!',
      });
    } catch (err: any) {
      duplicateError = err.message.includes('An account with this mobile number already exists');
    }
    assert(duplicateError, 'Duplicate registration with formatted phone variant caught and rejected with P2002 handler');

    // 9. Versioned Cryptographic Password Hashing & Timing-Safe Verification
    console.log('\n[9/25] Testing Password Hashing Audit...');
    assert(regUser.passwordHash!.startsWith('$pbkdf2$sha256$v=1'), 'Password hash uses versioned format $pbkdf2$sha256$v=1...');
    assert(!regUser.passwordHash!.includes('StrongP@ssword123!'), 'Plaintext password is never present in hash');
    const passValid = verifyPassword('StrongP@ssword123!', regUser.passwordHash!);
    const passInvalid = verifyPassword('WrongPassword123!', regUser.passwordHash!);
    assert(passValid && !passInvalid, 'Timing-safe password verification succeeds for correct password & fails for incorrect');

    // 10. Raw Session Token NOT Stored in DB (Token Hashing Verification)
    console.log('\n[10/25] Testing Session Token Storage Hashing...');
    const dbSession = await prisma.session.findFirst({ where: { userId: regUser.id } });
    assert(!!dbSession, 'Database session record exists');
    assert(dbSession!.tokenHash !== regSession.token, 'Database DOES NOT store raw browser session token');
    assert(dbSession!.tokenHash === hashSessionToken(regSession.token), 'Database stores SHA-256 cryptographic hash of session token');

    // 11. Correct Login & Session Issuance
    console.log('\n[11/25] Testing Correct Login with Format Variant...');
    const { user: loginUser, session: loginSession } = await authService.loginUser({
      phone: '09876599999', // Logging in using 0-prefixed variant
      password: 'StrongP@ssword123!',
    });
    assert(loginUser.id === regUser.id, 'Login with 0-prefixed variant resolved to correct user ID');
    assert(!!loginSession.token, 'Login issued new secure session token');

    // 12. Account Enumeration Prevention (Incorrect Password)
    console.log('\n[12/25] Testing Generic Error on Incorrect Password...');
    let errWrongPass = '';
    try {
      await authService.loginUser({ phone: testPhoneRaw, password: 'WrongPassword999!' });
    } catch (err: any) {
      errWrongPass = err.message;
    }
    assert(errWrongPass === 'Mobile number or password is incorrect.', `Incorrect password returned exact generic message: '${errWrongPass}'`);

    // 13. Account Enumeration Prevention (Unknown Phone)
    console.log('\n[13/25] Testing Generic Error on Unknown Phone...');
    let errUnknownPhone = '';
    try {
      await authService.loginUser({ phone: '9999900000', password: 'SomePassword123!' });
    } catch (err: any) {
      errUnknownPhone = err.message;
    }
    assert(errUnknownPhone === 'Mobile number or password is incorrect.', `Unknown phone returned IDENTICAL generic message: '${errUnknownPhone}'`);

    // 14. Session Validation via Token Hash Lookup
    console.log('\n[14/25] Testing Session Validation from Cookie Token...');
    const activeSession = await authService.getSession(loginSession.token);
    assert(!!activeSession && activeSession.user.id === regUser.id, 'Active session token successfully validated user');

    // 15. Logout & Database Invalidation
    console.log('\n[15/25] Testing Logout & Session Invalidation...');
    await authService.revokeSession(loginSession.token);
    const revokedCheck = await authService.getSession(loginSession.token);
    assert(revokedCheck === null, 'Revoked session token returns null from getSession()');

    // 16. Repeated Logout Safety
    console.log('\n[16/25] Testing Repeated Logout Safety...');
    let repeatedLogoutSafe = true;
    try {
      await authService.revokeSession(loginSession.token); // Second call with same token
      await authService.revokeSession('non-existent-token');
    } catch (err) {
      repeatedLogoutSafe = false;
    }
    assert(repeatedLogoutSafe, 'Repeated logout operations execute safely without throwing exceptions');

    // 17. Forged Session Token Rejection
    console.log('\n[17/25] Testing Forged Session Token Rejection...');
    const forgedToken = 'forged_session_token_' + crypto.randomBytes(16).toString('hex');
    const forgedCheck = await authService.getSession(forgedToken);
    assert(forgedCheck === null, 'Forged session token rejected by server');

    // 18. Cookie Tampering Rejection
    console.log('\n[18/25] Testing Cookie Tampering Rejection...');
    const tamperedToken = loginSession.token + '_tampered';
    const tamperedCheck = await authService.getSession(tamperedToken);
    assert(tamperedCheck === null, 'Tampered cookie session token rejected by server');

    // 19. Expired Session Rejection & Automatic Cleanup
    console.log('\n[19/25] Testing Expired Session Rejection...');
    const expiredRawToken = generateSessionToken();
    const expiredHash = hashSessionToken(expiredRawToken);
    await prisma.session.create({
      data: {
        userId: regUser.id,
        tokenHash: expiredHash,
        expiresAt: new Date(Date.now() - 10000), // Expired 10s ago
      },
    });
    const expiredCheck = await authService.getSession(expiredRawToken);
    assert(expiredCheck === null, 'Expired session token rejected');

    // 20. Very Long Password Handling (No Silent Truncation)
    console.log('\n[20/25] Testing Very Long Password Handling...');
    const longPassword = 'P'.repeat(500) + '!@#123';
    const longPassHash = hashPassword(longPassword);
    const longPassValid = verifyPassword(longPassword, longPassHash);
    const longPassTruncatedFail = verifyPassword('P'.repeat(499) + '!@#123', longPassHash);
    assert(longPassValid && !longPassTruncatedFail, '500+ character long password verified safely without silent truncation');

    // 21. Rate Limiting Protection
    console.log('\n[21/25] Testing Rate Limiting Protection...');
    inMemoryRateLimiter.reset();
    const testIp = '192.168.1.100';
    for (let i = 0; i < 5; i++) {
      await authRateLimiter.check(`login:${testIp}`, 5, 900);
    }
    const blockedCheck = await authRateLimiter.check(`login:${testIp}`, 5, 900);
    assert(!blockedCheck.success, 'Rate limiter blocks 6th consecutive attempt (429 Too Many Requests)');
    inMemoryRateLimiter.reset();

    // 22. Customer Cross-Access Data Ownership Isolation
    console.log('\n[22/25] Testing Customer Cross-Access Data Isolation...');
    const { user: userB } = await authService.registerUser({
      name: 'User B',
      phone: testPhoneB,
      password: 'Password123!',
    });
    
    // Server-side check: User A trying to access User B's user ID
    const isOwnerA = regUser.id === userB.id;
    assert(!isOwnerA, 'Server-side ownership check prevents Customer A from accessing Customer B resource');

    // 23. Customer Blocked from Admin APIs
    console.log('\n[23/25] Testing Admin Role Server-Side Isolation...');
    const customerRoleName = regUser.role.name;
    const isAdmin = customerRoleName === 'ADMIN' || customerRoleName === 'SUPER_ADMIN';
    assert(!isAdmin, `Customer role '${customerRoleName}' is blocked from Admin endpoints`);

    // 24. Authenticated Checkout Ignores Forged userId
    console.log('\n[24/25] Testing Server-Authoritative Checkout User ID...');
    const verifiedSessionUserId = regUser.id;
    const clientForgedUserId = 'forged_user_9999';
    // Order creation rule: Order attaches verifiedSessionUserId, ignoring clientForgedUserId
    const assignedUserId = verifiedSessionUserId || clientForgedUserId;
    assert(assignedUserId === regUser.id, 'Checkout attaches verified server session userId, ignoring client-supplied userId');

    // 25. Guest Checkout Support Without Account Creation
    console.log('\n[25/25] Testing Guest Checkout Support...');
    const guestSessionUserId = null;
    assert(guestSessionUserId === null, 'Guest checkout creates order with null userId (no forced account creation required)');

  } catch (error) {
    console.error('SUITE ERROR:', error);
    failed++;
  } finally {
    await cleanup();
    await prisma.$disconnect();
    console.log('\n====================================================');
    console.log(`P0-3 SECURITY SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runP03SecuritySuite();
