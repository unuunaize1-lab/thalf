import crypto from 'node:crypto';

/**
 * Versioned Cryptographically Secure Password Hashing & Verification
 * Format: $pbkdf2$sha256$v=1$i=100000$<salt_hex>$<hash_hex>
 */
const CURRENT_VERSION = 1;
const ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = 'sha256';

export function hashPassword(password: string): string {
  if (!password) {
    throw new Error('Password cannot be empty');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return `$pbkdf2$${DIGEST}$v=${CURRENT_VERSION}$i=${ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  try {
    // Handle Versioned Format: $pbkdf2$sha256$v=1$i=100000$salt$hash
    if (storedHash.startsWith('$pbkdf2$')) {
      const parts = storedHash.split('$');
      // parts[0] = "", parts[1] = "pbkdf2", parts[2] = digest, parts[3] = "v=1", parts[4] = "i=100000", parts[5] = salt, parts[6] = hash
      if (parts.length < 7) return false;
      
      const digest = parts[2];
      const iterations = parseInt(parts[4].replace('i=', ''), 10);
      const salt = parts[5];
      const originalHash = parts[6];

      const hashToVerify = crypto.pbkdf2Sync(password, salt, iterations, KEY_LEN, digest).toString('hex');
      const bufOriginal = Buffer.from(originalHash, 'hex');
      const bufVerify = Buffer.from(hashToVerify, 'hex');

      if (bufOriginal.length !== bufVerify.length) return false;
      return crypto.timingSafeEqual(bufOriginal, bufVerify);
    }

    // Handle Legacy Format: salt:hash
    if (storedHash.includes(':')) {
      const [salt, originalHash] = storedHash.split(':');
      const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
      const bufOriginal = Buffer.from(originalHash, 'hex');
      const bufVerify = Buffer.from(hashToVerify, 'hex');

      if (bufOriginal.length !== bufVerify.length) return false;
      return crypto.timingSafeEqual(bufOriginal, bufVerify);
    }
  } catch (err) {
    return false;
  }

  return false;
}

/**
 * Generates an opaque random 32-byte session token for client browser cookies.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Computes a SHA-256 cryptographic hash of a session token for secure database storage.
 */
export function hashSessionToken(token: string): string {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
}
