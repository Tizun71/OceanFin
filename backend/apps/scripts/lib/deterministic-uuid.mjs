import { createHash } from 'node:crypto';

// Fixed namespace for OceanFin seed data. Changing it renames every seeded row.
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

const hexToBytes = (hex) =>
  Buffer.from(hex.replace(/-/g, ''), 'hex');

/**
 * RFC 4122 v5 (SHA-1, name-based) UUID.
 *
 * Seed rows need stable ids so re-running a seed updates the same row instead of
 * inserting a duplicate — the tables default to gen_random_uuid(), which would
 * make every run create new rows.
 */
export function deterministicUuid(name) {
  const hash = createHash('sha1')
    .update(hexToBytes(NAMESPACE))
    .update(Buffer.from(name, 'utf8'))
    .digest();

  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
