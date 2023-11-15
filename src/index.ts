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
  const buffer = new Uint8Array(view.buffer);
  return murmur3(buffer, seed);
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
  return murmur3(encoded, seed);
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
  return murmur3(encoded, seed);
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
  return murmur3(encoded, seed);
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
  return murmur3(encoded, seed);
}

/**
 * Hashes an object value into a unsigned int considering:
 *
 * - If it is `null`, returns a fixed value.
 * - If it has a `hashCode`, returns `hash(value.hashCode(), seed)`;
 * - If it has an overwritten `valueOf`, returns `hash(value.valueOf(), seed)`;
 * - If it has a `Symbol.iterator` and:
 *   - is an instance of `Set`, returns `hashValues(value, seed)`
 *   - is an instance of `Map`, returns `hashEntries(value, seed)`
 *   - otherwise, returns `hashSequence(value, seed)`
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
    seed = murmur3(encoded, seed);
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

  if (isIterable(value)) {
    if (value instanceof Set) return hashValues(value, seed);
    if (value instanceof Map) return hashEntries(value, seed);
    return hashSequence(value, seed);
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
  const temp = Uint32Array.from(value, mapfn);
  const buffer = new Uint8Array(temp.buffer);
  return murmur3(buffer, seed);
}

/**
 * Hashes an iterable into a unsigned int considering only the elements.
 *
 * @param value the elements iterable to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export function hashValues(value: Iterable<unknown>, seed = 0): number {
  const mapfn = (element: unknown) => hash(element, seed);
  // @ts-expect-error value is not required to be an number iterable if the
  //                  mapping function returns a number.
  const temp = Uint32Array.from(value, mapfn).sort();
  const buffer = new Uint8Array(temp.buffer);
  return murmur3(buffer, seed);
}

/**
 * Hashes an iterable into a unsigned int considering only the entries.
 *
 * @param value the entries iterable to be hashed
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
  const temp = Uint32Array.from(value, mapfn).sort();
  const buffer = new Uint8Array(temp.buffer);
  return murmur3(buffer, seed);
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

function isIterable(value: unknown): value is Iterable<unknown> {
  if (typeof value !== 'object' || value == null) return false;
  return (
    Symbol.iterator in value && typeof value[Symbol.iterator] === 'function'
  );
}
/**
 * Hashes an integer number into a unsigned int. Based on [Thomas Wang's
 * 6-shift integer hash algorithm][Wang].
 *
 * [Wang]: http://burtleburtle.net/bob/hash/integer.html
 *
 * @param input the number to be hashed
 * @returns an unsigned integer
 */
function wang(input: number, seed = 0): number {
  input = input ^ seed;
  input = input + ~(input << 15);
  input = input ^ (input >> 10);
  input = input + (input << 3);
  input = input ^ (input >> 6);
  input = input + ~(input << 11);
  input = input ^ (input >> 16);
  return input >>> 0;
}

/**
 * Returns the hash from the input array using the Murmur3 algorithm.
 *
 * @param input An Uint16Array
 * @param seed The seed of the hash
 * @returns an unsigned integer
 */
function murmur3(input: Uint8Array, seed: number): number {
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const buffer = new DataView(input.buffer, input.byteOffset);
  const remainder = input.byteLength & 3;
  const len = input.byteLength - remainder;
  let h1 = seed;
  let i = 0;

  // body
  while (i < len) {
    let k1 = buffer.getUint32(i, true);
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
      k1 = k1 ^ (input[i + 2] << 16);
    case 2:
      k1 = k1 ^ (input[i + 1] << 8);
    case 1:
      k1 = k1 ^ input[i];
      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);
      h1 = h1 ^ k1;
  }

  // finalization
  h1 = h1 ^ ((len + remainder) & 0xffffffff);
  h1 = h1 ^ (h1 >>> 16);
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 = h1 ^ (h1 >>> 13);
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 = h1 ^ (h1 >>> 16);

  return h1 >>> 0;
}
