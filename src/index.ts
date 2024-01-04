/* eslint-disable no-fallthrough */

/**
 * Hashes an value into a unsigned int.
 *
 * @param value a value to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hash(value: unknown, seed = 0): number {
  switch (typeof value) {
    case 'undefined':
      return (UNDEFINED_KEY ^ seed) >>> 0;
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
    case 'bigint':
      return hashBigint(value, seed);
    default:
      return (seed ^ UNKNOWN_KEY) >>> 0;
  }
}

/**
 * Hashes a boolean into a unsigned int.
 *
 * @param value the boolean to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashBoolean(value: boolean, seed = 0): number {
  if (value) {
    return (TRUE_KEY ^ seed) >>> 0;
  } else {
    return (FALSE_KEY ^ seed) >>> 0;
  }
}

/**
 * Hashes an number into a unsigned int.
 *
 * @param value the number to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashNumber(value: number, seed = 0): number {
  // If integer is small enough, use wang. Otherwise, use murmur on dataview.
  if (Number.isInteger(value) && value < 0xffffffff) {
    // Make sure that +0 and -0 returns the same value.
    return value === 0 ? wang(0, seed) : wang(value, seed);
  }
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value, true);
  return murmur3(view.buffer, seed);
}

/**
 * Hashes a string into a unsigned int considering its Unicode Normalization
 * NFD form.
 *
 * @param value the string to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashString(value: string, seed = 0): number {
  const normalized = value.normalize('NFD');
  const encoded = encode(normalized);
  return murmur3(encoded.buffer, seed);
}

/**
 * Hashes a bigint into a unsigned int considering its string representation.
 *
 * @param value the bigint to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashBigint(value: bigint, seed = 0): number {
  const encoded = encode(value.toString(36));
  return murmur3(encoded.buffer, seed);
}

/**
 * Hashes a symbol into a unsigned int considering its string representation.
 *
 * @param value the symbol to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashSymbol(value: symbol, seed = 0): number {
  const encoded = encode(value.toString());
  return murmur3(encoded.buffer, seed);
}

/**
 * Hashes a function into a unsigned int considering its string representation.
 *
 * @param value the function to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function hashFunction(value: Function, seed = 0): number {
  const encoded = encode(value.toString());
  return murmur3(encoded.buffer, seed);
}

/**
 * Hashes an object value into a unsigned int considering:
 *
 * - If it is `null`, returns a fixed value.
 * - If it has a `hashCode`, returns `hash(value.hashCode(), seed)`;
 * - If it has an overwritten `valueOf`, returns `hash(value.valueOf(), seed)`;
 * - If it is an instance of `ArrayBuffer`, returns `hashBytes(value)`;
 * - If `ArrayBuffer.isView(value)` is true, returns `hashBytes(value.buffer)`;
 * - If it has a `Symbol.iterator` and:
 *   - is an instance of `Set`, returns `hashValues(value, seed)`;
 *   - is an instance of `Map`, returns `hashEntries(value, seed)`;
 *   - otherwise, returns `hashSequence(value, seed)`.
 * - Otherwise, returns `hashEntries(Object.entries(value))`.
 *
 * To avoid collisions, this methods also considers the `value.constructor.name`
 * in the hashing, i.e., objects with equal properties but different
 * constructors can have a different hashes.
 *
 * @param value the object to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashObject(value: object | null, seed = 0): number {
  if (value === null) return (NULL_KEY ^ seed) >>> 0;

  // changes the seed to use the constructor's name
  if ('constructor' in value && typeof value.constructor === 'function') {
    const encoded = encode(value.constructor.name);
    seed = murmur3(encoded.buffer, seed);
  }

  if ('hashCode' in value && typeof value.hashCode === 'function') {
    return hash(value.hashCode(), seed);
  }

  if (
    'valueOf' in value &&
    typeof value.valueOf === 'function' &&
    value.valueOf !== Object.prototype.valueOf
  ) {
    return hash(value.valueOf(), seed);
  }

  if (value instanceof ArrayBuffer) return hashBytes(value, seed);
  if (ArrayBuffer.isView(value)) return hashBytes(value.buffer, seed);

  if (
    Symbol.iterator in value &&
    typeof value[Symbol.iterator] === 'function'
  ) {
    if (value instanceof Set) return hashValues(value, seed);
    if (value instanceof Map) return hashEntries(value, seed);
    return hashSequence(value as Iterable<unknown>, seed);
  }

  return hashEntries(Object.entries(value), seed);
}

/**
 * Hashes an iterable into a unsigned int considering the value and the order
 * of the elements.
 *
 * @param value the iterable to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashSequence(value: Iterable<unknown>, seed = 0): number {
  const mapfn = (element: unknown) => hash(element, seed);
  // @ts-expect-error value is not required to be an number iterable if the
  //                  mapping function returns a number.
  const hashes = Uint32Array.from(value, mapfn);
  return murmur3(hashes.buffer, seed);
}

/**
 * Hashes an iterable into a unsigned int considering only the elements.
 *
 * @param value the iterable to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashValues(value: Iterable<unknown>, seed = 0): number {
  const mapfn = (element: unknown) => hash(element, seed);
  // @ts-expect-error value is not required to be an number iterable if the
  //                  mapping function returns a number.
  const hashes = Uint32Array.from(value, mapfn).sort();
  return murmur3(hashes.buffer, seed);
}

/**
 * Hashes an iterable into a unsigned int considering only the entries.
 *
 * @param value the iterable to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashEntries(
  value: Iterable<[unknown, unknown]>,
  seed = 0,
): number {
  const mapfn = (element: [unknown, unknown]) => hashSequence(element, seed);
  // @ts-expect-error value is not required to be an number iterable if the
  //                  mapping function returns a number.
  const hashes = Uint32Array.from(value, mapfn).sort();
  return murmur3(hashes.buffer, seed);
}

/**
 * Hashes a buffer into a unsigned int.
 *
 * @param value the buffer to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashBytes(value: ArrayBufferLike, seed = 0): number {
  return murmur3(value, seed);
}

/**
 * Returns a new seed for the given string.
 *
 * @param str a string to generate a seed
 * @returns an unsigned integer
 */
export const getSeed = (str: string): number => {
  return hashString(str, 0);
};

const FALSE_KEY = 0x42108420;
const TRUE_KEY = 0x42108421;
const NULL_KEY = 0x42108422;
const UNDEFINED_KEY = 0x42108423;
const UNKNOWN_KEY = 0x42108424;

const encode = TextEncoder.prototype.encode.bind(new TextEncoder('utf-8'));

/**
 * Hashes an integer number into a unsigned int using the [Thomas Wang's
 * ][Wang] 32bit shift and multiplication algorithm.
 *
 * [Wang]: http://web.archive.org/web/20071223173210/http://www.concentric.net/~Ttwang/tech/inthash.htm
 *
 * @param int the integer to be hashed
 * @returns an unsigned integer
 */
function wang(int: number, seed = 0): number {
  const c1 = 0x27d4eb2d;
  int = int ^ seed;
  int = int ^ 61 ^ (int >>> 16);
  int = int + (int << 3);
  int = int ^ (int >>> 4);
  int = Math.imul(int, c1);
  int = int ^ (int >>> 15);
  return int >>> 0;
}

/**
 * Returns the hash from the input array using the [Murmur3 algorithm][Murmur3].
 *
 * [Murmur3]: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
 *
 * @param buffer The bytes to be hashed
 * @param seed The seed of the hash
 * @returns an unsigned integer
 */
function murmur3(buffer: ArrayBufferLike, seed: number): number {
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const view = new DataView(buffer);
  const remainder = buffer.byteLength & 3;
  const byteLength = buffer.byteLength - remainder;
  let h1 = seed;
  let i = 0;

  // body
  while (i < byteLength) {
    let k1 = view.getUint32(i, true);
    i = i + 4;
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 = h1 ^ k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  // tail
  let k1: number = 0x0;
  switch (remainder) {
    case 3:
      k1 = k1 ^ (view.getUint8(i + 2) << 16);
    case 2:
      k1 = k1 ^ (view.getUint8(i + 1) << 8);
    case 1:
      k1 = k1 ^ view.getUint8(i);
      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);
      h1 = h1 ^ k1;
  }

  // finalization
  h1 = h1 ^ ((byteLength + remainder) & 0xffffffff);
  h1 = h1 ^ (h1 >>> 16);
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 = h1 ^ (h1 >>> 13);
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 = h1 ^ (h1 >>> 16);

  return h1 >>> 0;
}
