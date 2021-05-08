/**
 * Hash of `chongo <Landon Curt Noll> /\../\` with zero offset.
 */
const defaultSeed = 0x811c9dc5;

/**
 * Hashes an value into a unsigned int. You can also pass a seed to initialize
 * the hashing. It handles most of trivial ECMAScript values and delegates for
 * a specialized hash function bellow.
 */
export const hash = (value: unknown, seed = defaultSeed): number => {
  switch (typeof value) {
    case 'undefined':
      return (0x42108423 ^ seed) >>> 0;
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
      return (0x42108424 ^ seed) >>> 0;
  }
};

/**
 * Hashes a boolean into a unsigned int. Guarantees different results for the
 * `true` and `false`. You can also pass a seed to initialize the hashing.
 */
export const hashBoolean = (bool: boolean, seed = defaultSeed): number => {
  if (bool) {
    return (0x42108421 ^ seed) >>> 0;
  } else {
    return (0x42108420 ^ seed) >>> 0;
  }
};

/**
 * Hashes a number into a unsigned int. Based on Thomas Wang's 7-shift integer
 * hash algorithm. Provides support for `NaN`, `Infinity` and `-Infinity`. You
 * can also pass a seed to initialize the hashing.
 */
export const hashNumber = (num: number, seed = defaultSeed): number => {
  if (Number.isNaN(num)) return (0x42108425 ^ seed) >>> 0;
  if (num === Number.POSITIVE_INFINITY) return (0x42108426 ^ seed) >>> 0;
  if (num === Number.NEGATIVE_INFINITY) return (0x42108427 ^ seed) >>> 0;
  let hashed = num ^ seed;
  hashed -= hashed << 6;
  hashed ^= hashed >> 17;
  hashed -= hashed << 9;
  hashed ^= hashed << 4;
  hashed -= hashed << 3;
  hashed ^= hashed << 10;
  hashed ^= hashed >> 15;
  return hashed >>> 0;
};

/**
 * Hashes a string into a unsigned int. Based on FNV-1a Hashing algorithm.
 * Provides support for unicode strings. You can also pass a seed to initialize
 * the hashing.
 */
export const hashString = (str: string, seed = defaultSeed): number => {
  const unescaped = unescape(encodeURIComponent(str));
  const length = unescaped.length;
  let hashed = seed;
  let i = 0;
  while (i < length) {
    hashed ^= unescaped.charCodeAt(i);
    hashed +=
      (hashed << 1) +
      (hashed << 4) +
      (hashed << 7) +
      (hashed << 8) +
      (hashed << 24);
    i += 1;
  }
  return hashed >>> 0;
};

/**
 * Hashes a symbol into a unsigned int considering its string representation.
 * You can also pass a seed to initialize the hashing.
 */
export const hashSymbol = (sym: symbol, seed = defaultSeed): number => {
  return hashString(sym.toString(), seed);
};

/**
 * Hashes a function into a unsigned int considering its string representation.
 * You can also pass a seed to initialize the hashing.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const hashFunction = (fun: Function, seed = defaultSeed): number => {
  return hashString(fun.toString(), seed);
};

/**
 * Hashes an object value into a unsigned int considering:
 *
 * - If it has an `hashCode` method, returns the `obj.hashCode() >>> 0`;
 * - If it is an iterable, returns the `hashIterable(obj, seed)`;
 * - If it has an `valueOf` method that does not returns itself, returns
 *   `hash(obj.valueOf(), seed)`;
 * - Otherwise, returns `hashIterableAsMap(Object.entries(obj))`.
 *
 * Provides support for `null` values.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const hashObject = (obj: object | null, seed = defaultSeed): number => {
  if (obj === null) {
    return (0x42108422 ^ seed) >>> 0;
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
      return hashIterableAsMap(Object.entries(obj), seed);
    }
  }
};

const hashArray = (arr: Array<number>, seed: number): number => {
  const length = arr.length;
  let hashed = seed;
  let i = 0;
  while (i < length) {
    hashed ^= arr[i];
    hashed +=
      (hashed << 1) +
      (hashed << 4) +
      (hashed << 7) +
      (hashed << 8) +
      (hashed << 24);
    i += 1;
  }
  return hashed >>> 0;
};

/**
 * Hashes an iterable into a unsigned int considering its content. Based on
 * FNV-1a Hashing algorithm where each element of the iterable is hashed with
 * `hash`. You can also pass a seed to initialize the hashing.
 */
export const hashIterable = (
  itr: Iterable<unknown>,
  seed = defaultSeed
): number => {
  const arr = Array.from(itr, (value) => hash(value, seed));
  return hashArray(arr, seed);
};

/**
 * Hashes an iterable into a unsigned int ignoring the order of the elements.
 * Based on FNV-1a Hashing algorithm where each element of the iterable is
 * hashed with `hash`. You can also pass a seed to initialize the hashing.
 */
export const hashIterableAsSet = (
  itr: Iterable<unknown>,
  seed = defaultSeed
): number => {
  const arr = Array.from(itr, (value) => hash(value, seed)).sort();
  return hashArray(arr, seed);
};

/**
 * Hashes an iterable into a unsigned int ignoring the order of the keys. Based
 * on FNV-1a Hashing algorithm where each entry of the iterable is hashed with
 * `hash`. You can also pass a seed to initialize the hashing.
 */
export const hashIterableAsMap = (
  itr: Iterable<[unknown, unknown]>,
  seed = defaultSeed
): number => {
  type Trio = [number, [unknown, unknown]];
  const createTrio = (entry: [unknown, unknown]): Trio => {
    return [hash(entry[0], seed), entry];
  };
  const compareTrio = (a: Trio, b: Trio): number => {
    return a[0] - b[0];
  };
  const hashTrio = (trio: Trio): number => {
    return hash(trio[1], seed);
  };
  const arr = Array.from(itr, createTrio).sort(compareTrio).map(hashTrio);
  return hashArray(arr, seed);
};

/**
 * Returns a new seed for the given string.
 */
export const getSeed = (str: string): number => {
  return hashString(str, defaultSeed);
};
