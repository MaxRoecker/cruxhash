export type Seed = [number, number];

const defaultSeed: Seed = [0x9dc5, 0x811c];

const hexLUT = Array.from({ length: 256 }, (_, index) => {
  return ((index >> 4) & 15).toString(16) + (index & 15).toString(16);
});

/**
 * Returns a new seed pair from a string.
 */
export const getSeed = (str: string): Seed => {
  const value = hashString(str, defaultSeed);
  const hex =
    hexLUT[value >>> 24] +
    hexLUT[(value >>> 16) & 255] +
    hexLUT[(value >>> 8) & 255] +
    hexLUT[value & 255];
  const s0 = parseInt(hex.substr(0, 4), 16);
  const s1 = parseInt(hex.substr(4, 4), 16);
  return [s0, s1];
};

/**
 * Hashes a boolean into a unsigned int.
 */
export const hashBoolean = (bool: boolean, seed = defaultSeed): number => {
  return bool ? (0x42108421 ^ seed[0]) >>> 0 : (0x42108420 ^ seed[1]) >>> 0;
};

/**
 * Hashes a number into a unsigned int.
 */
export const hashNumber = (num: number, seed = defaultSeed): number => {
  if (Number.isNaN(num)) return (0x42108425 ^ seed[0]) >>> 0;
  if (num === Number.POSITIVE_INFINITY) return (0x42108426 ^ seed[0]) >>> 0;
  if (num === Number.NEGATIVE_INFINITY) return (0x42108426 ^ seed[1]) >>> 0;
  let hashed = (num | 0) ^ seed[0];
  hashed -= hashed << 6;
  hashed ^= hashed >>> 17;
  hashed -= hashed << 9;
  hashed ^= hashed << 4;
  hashed -= hashed << 3;
  hashed ^= hashed << 10;
  hashed ^= hashed >>> 15;
  return hashed >>> 0;
};

/**
 * Hashes a string into a unsigned int.
 */
export const hashString = (str: string, seed = defaultSeed): number => {
  const length = str.length;
  let i = 0;
  let t0 = 0;
  let t1 = 0;
  let v0 = seed[0] | 0;
  let v1 = seed[1] | 0;

  while (i < length) {
    let char = str.charCodeAt(i);
    if (char < 128) {
      v0 ^= char;
    } else if (char < 2048) {
      v0 ^= (char >> 6) | 192;
      t0 = v0 * 403;
      t1 = v1 * 403;
      t1 += v0 << 8;
      v1 = (t1 + (t0 >>> 16)) & 65535;
      v0 = t0 & 65535;
      v0 ^= (char & 63) | 128;
    } else if (
      (char & 64512) == 55296 &&
      i + 1 < length &&
      (str.charCodeAt(i + 1) & 64512) == 56320
    ) {
      char = 65536 + ((char & 1023) << 10) + (str.charCodeAt(++i) & 1023);
      v0 ^= (char >> 18) | 240;
      t0 = v0 * 403;
      t1 = v1 * 403;
      t1 += v0 << 8;
      v1 = (t1 + (t0 >>> 16)) & 65535;
      v0 = t0 & 65535;
      v0 ^= ((char >> 12) & 63) | 128;
      t0 = v0 * 403;
      t1 = v1 * 403;
      t1 += v0 << 8;
      v1 = (t1 + (t0 >>> 16)) & 65535;
      v0 = t0 & 65535;
      v0 ^= ((char >> 6) & 63) | 128;
      t0 = v0 * 403;
      t1 = v1 * 403;
      t1 += v0 << 8;
      v1 = (t1 + (t0 >>> 16)) & 65535;
      v0 = t0 & 65535;
      v0 ^= (char & 63) | 128;
    } else {
      v0 ^= (char >> 12) | 224;
      t0 = v0 * 403;
      t1 = v1 * 403;
      t1 += v0 << 8;
      v1 = (t1 + (t0 >>> 16)) & 65535;
      v0 = t0 & 65535;
      v0 ^= ((char >> 6) & 63) | 128;
      t0 = v0 * 403;
      t1 = v1 * 403;
      t1 += v0 << 8;
      v1 = (t1 + (t0 >>> 16)) & 65535;
      v0 = t0 & 65535;
      v0 ^= (char & 63) | 128;
    }
    t0 = v0 * 403;
    t1 = v1 * 403;
    t1 += v0 << 8;
    v1 = (t1 + (t0 >>> 16)) & 65535;
    v0 = t0 & 65535;

    i += 1;
  }

  return ((v1 << 16) >>> 0) + v0;
};

/**
 * Hashes a symbol into a unsigned int.
 */
export const hashSymbol = (sym: symbol, seed = defaultSeed): number => {
  return hashString(sym.toString(), seed);
};

/**
 * Hashes a function into a unsigned int considering its string representation.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const hashFunction = (fun: Function, seed = defaultSeed): number => {
  return hashString(fun.toString(), seed);
};

/**
 * Hashes an iterable into a unsigned int considering its content.
 */
export const hashIterable = (
  itr: Iterable<unknown>,
  seed = defaultSeed
): number => {
  const arr = Array.isArray(itr) ? itr : Array.from(itr);
  let hashed = seed[0];
  for (let i = 0; i < arr.length; i += 1) {
    hashed ^= hash(arr[i], seed);
  }
  return hashed >>> 0;
};

/**
 * Hashes an object into a unsigned int considering `Object.entries`.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const hashObject = (obj: object | null, seed = defaultSeed): number => {
  if (obj === null) {
    return 0x42108422 ^ seed[1];
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target: any = obj;
    if (typeof target.hashCode === 'function') {
      return target.hashCode() >>> 0;
    } else if (target[Symbol.iterator] != undefined) {
      return hashIterable(target, seed);
    } else if (typeof obj.valueOf === 'function' && obj.valueOf() !== obj) {
      return hash(obj.valueOf(), seed);
    } else {
      const entries = Object.entries(obj);
      const sorted = entries.sort((a, b) => a[0].localeCompare(b[0]));
      return hashIterable(sorted, seed);
    }
  }
};

/**
 * Hashes an value into a unsigned int.
 */
export const hash = (value: unknown, seed = defaultSeed): number => {
  switch (typeof value) {
    case 'undefined':
      return 0x42108423 ^ seed[0];
    case 'boolean':
      return hashBoolean(value, seed);
    case 'number':
      return hashNumber(value, seed);
    case 'string':
      return hashString(value, seed);
    case 'symbol':
      return hashSymbol(value, seed);
    case 'function':
      return hashFunction(value, seed);
    case 'object':
      return hashObject(value, seed);
    default:
      return 0x42108424 ^ seed[1];
  }
};
