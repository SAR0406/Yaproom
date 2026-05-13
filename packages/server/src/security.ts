import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import { config } from './config.js';

const ENCRYPTION_PREFIX = 'enc:v1';
const SCRYPT_KEYLEN = 64;
const ADMIN_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

export function parseBasicAuth(request: FastifyRequest): { username: string; password: string } | null {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Basic ')) {
    return null;
  }

  const encoded = authHeader.slice('Basic '.length).trim();
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 0) return null;
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    return { username, password };
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  if (!timingSafeTextEqual(username, config.adminUsername)) {
    return false;
  }

  if (!config.adminPasswordHash) {
    return false;
  }

  const [scheme, saltHex, digestHex] = config.adminPasswordHash.split(':');
  if (scheme !== 'scrypt' || !saltHex || !digestHex) {
    return false;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(digestHex, 'hex');
  const derived = scryptSync(password, salt, expected.length || SCRYPT_KEYLEN);

  if (expected.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(expected, derived);
}

export function parseBearerAuth(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  return token || null;
}

export function createAdminSessionToken(username: string, expiresInMs = ADMIN_TOKEN_TTL_MS): string {
  const expiresAt = Date.now() + expiresInMs;
  const payload = { username, expiresAt };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signTokenPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token: string): { username: string; expiresAt: number } | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signTokenPayload(encodedPayload);
  if (!timingSafeTextEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      username?: string;
      expiresAt?: number;
    };

    if (typeof payload.username !== 'string' || typeof payload.expiresAt !== 'number') {
      return null;
    }

    if (payload.expiresAt <= Date.now()) {
      return null;
    }

    if (!timingSafeTextEqual(payload.username, config.adminUsername)) {
      return null;
    }

    return { username: payload.username, expiresAt: payload.expiresAt };
  } catch {
    return null;
  }
}

export function encryptForStorage(payload: unknown): unknown {
  if (!config.appEncryptionKey) {
    return payload;
  }

  const key = Buffer.from(config.appEncryptionKey, 'base64');
  if (key.length !== 32) {
    return payload;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: true,
    format: ENCRYPTION_PREFIX,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64')
  };
}

export function decryptFromStorage<T>(payload: unknown): T | null {
  if (!config.appEncryptionKey || !isEncryptedPayload(payload)) {
    return payload as T;
  }

  try {
    const key = Buffer.from(config.appEncryptionKey, 'base64');
    if (key.length !== 32) {
      return null;
    }
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(payload.iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.data, 'base64')),
      decipher.final()
    ]);
    return JSON.parse(decrypted.toString('utf8')) as T;
  } catch {
    return null;
  }
}

function isEncryptedPayload(
  value: unknown
): value is { format: string; iv: string; tag: string; data: string } {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.format === ENCRYPTION_PREFIX &&
    typeof candidate.iv === 'string' &&
    typeof candidate.tag === 'string' &&
    typeof candidate.data === 'string'
  );
}

function timingSafeTextEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

function signTokenPayload(payload: string): string {
  const secret =
    config.adminSessionSecret ||
    config.appEncryptionKey ||
    config.adminPasswordHash ||
    'yapzi-dev-admin-secret';

  return createHmac('sha256', secret).update(payload).digest('base64url');
}
