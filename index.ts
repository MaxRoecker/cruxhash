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
      return (seed ^ 0x42108423) >>> 0;
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
      return (seed ^ 0x42108424) >>> 0;
  }
};

/**
 * Hashes a boolean into a unsigned int. Guarantees different results for the
 * `true` and `false`. You can also pass a seed to initialize the hashing.
 */
export const hashBoolean = (value: boolean, seed = defaultSeed): number => {
  if (value) {
    return (seed ^ 0x42108421) >>> 0;
  } else {
    return (seed ^ 0x42108420) >>> 0;
  }
};

/**
 * Hashes a number into a unsigned int. Based on Thomas Wang's 7-shift integer
 * hash algorithm. Provides support for `NaN`, `Infinity` and `-Infinity`. You
 * can also pass a seed to initialize the hashing.
 */
export const hashNumber = (value: number, seed = defaultSeed): number => {
  if (Number.isNaN(value)) return (seed ^ 0x42108425) >>> 0;
  if (value === Number.POSITIVE_INFINITY) return (seed ^ 0x42108426) >>> 0;
  if (value === Number.NEGATIVE_INFINITY) return (seed ^ 0x42108427) >>> 0;
  let hashed = seed ^ value;
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
export const hashString = (value: string, seed = defaultSeed): number => {
  const unescaped = unescape(encodeURIComponent(value));
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
export const hashSymbol = (value: symbol, seed = defaultSeed): number => {
  return hashString(value.toString(), seed);
};

/**
 * Hashes a function into a unsigned int considering its string representation.
 * You can also pass a seed to initialize the hashing.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const hashFunction = (value: Function, seed = defaultSeed): number => {
  return hashString(value.toString(), seed);
};

/**
 * Hashes an object value into a unsigned int considering:
 *
 * - If it is `null`, returns a fixed value.
 * - If it has a `hashCode`, returns `hash(obj.hashCode(), seed)`;
 * - If it has an overwritten `valueOf`, returns `hash(obj.valueOf(), seed)`;
 * - If it has a `Symbol.iterator`, returns `hashIterable(obj, seed)`;
 * - Otherwise, returns `hashIterableAsMap(Object.entries(obj))`.
 */
export const hashObject = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  value: object | null,
  seed = defaultSeed
): number => {
  if (value === null) return (seed ^ 0x42108422) >>> 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: any = value;
  if (typeof obj.hashCode === 'function') {
    return hash(obj.hashCode(), seed);
  } else if (
    typeof obj.valueOf === 'function' &&
    obj.valueOf !== Object.prototype.valueOf
  ) {
    return hash(obj.valueOf(), seed);
  } else if (obj[Symbol.iterator] != undefined) {
    return hashIterable(obj, seed);
  } else {
    return hashIterableAsMap(Object.entries(obj), seed);
  }
};

/**
 * Hashes an iterable into a unsigned int considering its content. Based on
 * FNV-1a Hashing algorithm where each element of the iterable is hashed with
 * `hash`. You can also pass a seed to initialize the hashing.
 */
export const hashIterable = (
  value: Iterable<unknown>,
  seed = defaultSeed
): number => {
  const arr = Array.from(value, (value) => hash(value, seed));
  return hashArray(arr, seed);
};

/**
 * Hashes an iterable into a unsigned int ignoring the order of the elements.
 * Based on FNV-1a Hashing algorithm where each element is hashed with `hash`.
 * You can also pass a seed to initialize the hashing.
 */
export const hashIterableAsSet = (
  value: Iterable<unknown>,
  seed = defaultSeed
): number => {
  const arr = Array.from(value, (value) => hash(value, seed)).sort();
  return hashArray(arr, seed);
};

/**
 * Hashes an iterable into a unsigned int ignoring the order of the entries.
 * Based on FNV-1a Hashing algorithm where each entry is hashed with
 * `hashIterable`. You can also pass a seed to initialize the hashing.
 */
export const hashIterableAsMap = (
  value: Iterable<[unknown, unknown]>,
  seed = defaultSeed
): number => {
  const arr = Array.from(value, (value) => hashIterable(value)).sort();
  return hashArray(arr, seed);
};

/**
 * Returns a new seed for the given string.
 */
export const getSeed = (str: string): number => {
  return hashString(str, defaultSeed);
};

const hashArray = (value: Array<number>, seed: number): number => {
  const length = value.length;
  let hashed = seed;
  let i = 0;
  while (i < length) {
    hashed ^= value[i];
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
