// lib/puzzle.ts
// Deterministic daily puzzle logic
// The puzzle is a 4x4 grid (16 cells). Each day we pick one index [0..15]
// based on a date-based seed. The algorithm must produce the same result
// for everyone given the same date.

function dateKey(d: Date) {
  // Use UTC date to avoid timezone differences
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Simple 32-bit xorshift PRNG seeded from the dateKey string hash.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToInt(str: string) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getDateKey(date = new Date()) {
  return dateKey(date);
}

export function getSolutionIndexForDate(date = new Date()) {
  // Use dateKey + stable salt to get deterministic seed
  const key = dateKey(date) + "|gridly-v1";
  const seed = hashStringToInt(key);
  const rnd = mulberry32(seed);
  // Get a number in 0..15
  return Math.floor(rnd() * 16);
}

export function getGridSize() {
  return 4;
}

export function isSameDay(a: string, b: string) {
  return a === b;
}

// Parse a `YYYY-MM-DD` date key into a Date at UTC midnight. Useful for dev overrides.
export function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map((s) => parseInt(s, 10));
  return new Date(Date.UTC(y, m - 1, d));
}

/*
Comments on logic:
- We use UTC date to ensure all users see the same daily puzzle regardless of local timezone.
- The date string is hashed into a 32-bit integer and used to seed a small PRNG (mulberry32)
  which yields a uniform float in [0,1). Multiplying by 16 gives an index 0..15.
- The salt "gridly-v1" allows future updates to the puzzle generation algorithm without
  changing historic puzzles.
*/
