// ============================================================
// seed.ts — Deterministic PRNG (Mulberry32) for reproducible mock data
// ============================================================

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

/** Returns a float in [0, 1) */
export function random(): number {
  return rng();
}

/** Returns an integer in [min, max] (inclusive) */
export function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

/** Returns a float in [min, max) */
export function randomFloat(min: number, max: number): number {
  return random() * (max - min) + min;
}

/** Box-Muller transform for normally distributed values */
export function normalRandom(mean: number, std: number): number {
  const u1 = random();
  const u2 = random();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Pick a random element from an array */
export function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Apply random noise to a value (e.g. noise=0.15 means +/-15%) */
export function withNoise(value: number, noise: number): number {
  const factor = 1 + randomFloat(-noise, noise);
  return value * factor;
}
