/**
 * Hashes an value into a unsigned int. You can also pass a seed to initialize
 * the hashing. It handles most of trivial ECMAScript values and delegates for
 * a specialized hash function.
 *
 * @param value a value to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export const hash = (value: unknown, seed = 0): number => {
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
 *
 * @param value the boolean to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export const hashBoolean = (value: boolean, seed = 0): number => {
  if (value) {
    return (seed ^ 0x42108421) >>> 0;
  } else {
    return (seed ^ 0x42108420) >>> 0;
  }
};

/**
 * Hashes an arbitrary number into a unsigned int. Based on [Thomas Wang's
 * 7-shift integer hash algorithm][Wang]. Provides support for `NaN`, `Infinity` and
 * `-Infinity`. You can also pass a seed to initialize the hashing.
 *
 * [Wang]: http://burtleburtle.net/bob/hash/integer.html
 *
 * @param value the number to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export const hashNumber = (value: number, seed = 0): number => {
  if (Number.isNaN(value)) return (seed ^ 0x42108425) >>> 0;
  if (value === Number.POSITIVE_INFINITY) return (seed ^ 0x42108426) >>> 0;
  if (value === Number.NEGATIVE_INFINITY) return (seed ^ 0x42108427) >>> 0;

  let hashed = seed;

  // if there is an decimal part, take some of them as integers
  if (!Number.isInteger(value)) {
    value = value * 0xffffffff;
  }

  // folds the value into an integer
  do {
    hashed = hashed ^ value;
    value = value / 0xffffffff;
  } while (value > 0xffffffff);

  // hashes the integer with Thomas Wang's algorithm
  hashed = hashed - (hashed << 6);
  hashed = hashed ^ (hashed >>> -15);
  hashed = hashed - (hashed << 9);
  hashed = hashed ^ (hashed << 4);
  hashed = hashed - (hashed << 3);
  hashed = hashed ^ (hashed << 10);
  hashed = hashed ^ (hashed >>> 15);

  return hashed >>> 0;
};

/**
 * Hashes a string into a unsigned int. Based on [Murmur3][Murmur3] hashing
 * algorithm. It performs an Unicode Normalization on the given string. You can
 * also pass a seed to initialize the hashing.
 *
 * [Murmur3]: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
 *
 * @param value the string to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export const hashString = (value: string, seed = 0): number => {
  value = value.normalize('NFD');
  const rem = value.length & 3; // "x & 3" is equals to "x % 4"
  const len = value.length - rem;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const c3 = 0xe6546b64;
  const c4 = 0x85ebca6b;
  const c5 = 0xc2b2ae35;
  let hashed = seed;
  let k = 0;
  let i = 0;

  while (i < len) {
    k = k ^ ((value.charCodeAt(i++) & 0xffff) << 0);
    k = k ^ ((value.charCodeAt(i++) & 0xffff) << 8);
    k = k ^ ((value.charCodeAt(i++) & 0xffff) << 16);
    k = k ^ ((value.charCodeAt(i++) & 0xffff) << 24);
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> -15);
    k = Math.imul(k, c2);
    hashed = hashed ^ k;
    hashed = (hashed << 13) | (hashed >>> -13);
    hashed = (Math.imul(hashed, 5) + c3) & 0xffffffff;
  }

  k = 0;

  if (rem === 3) k = k ^ ((value.charCodeAt(i + 2) & 0xffff) << 16);
  if (rem >= 2) k = k ^ ((value.charCodeAt(i + 1) & 0xffff) << 8);
  if (rem >= 1) {
    k = k ^ ((value.charCodeAt(i + 0) & 0xffff) << 0);
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> -15);
    k = Math.imul(k, c2);
    hashed = hashed ^ k;
  }

  hashed = hashed ^ value.length;

  hashed = hashed ^ (hashed >> 16);
  hashed = Math.imul(hashed, c4);
  hashed = hashed ^ (hashed >> 13);
  hashed = Math.imul(hashed, c5);
  hashed = hashed ^ (hashed >> 16);

  return hashed >>> 0;
};

/**
 * Hashes a symbol into a unsigned int considering its string representation.
 * You can also pass a seed to initialize the hashing.
 *
 * @param value the symbol to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export const hashSymbol = (value: symbol, seed = 0): number => {
  return hashString(value.toString(), seed);
};

/**
 * Hashes a function into a unsigned int considering its string representation.
 * You can also pass a seed to initialize the hashing.
 *
 * @param value the function to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const hashFunction = (value: Function, seed = 0): number => {
  return hashString(value.toString(), seed);
};

/**
 * Hashes an object value into a unsigned int considering:
 *
 * - If it is `null`, returns a fixed value.
 * - If it has a `hashCode`, returns `hash(value.hashCode(), seed)`;
 * - If it has an overwritten `valueOf`, returns `hash(value.valueOf(), seed)`;
 * - If it has a `Symbol.iterator` and:
 *   - is an instance of `Set`, returns `hashIterableAsSet(value, seed)`
 *   - is an instance of `Map`, returns `hashIterableAsMap(value, seed)`
 *   - otherwise, returns `hashIterable(value, seed)`
 * - Otherwise, returns `hashIterableAsMap(Object.entries(value))`.
 *
 * To avoid collisions, this methods also considers the `value.constructor.name`
 * in the hashing, i.e., objects with equal properties but different
 * constructors can have a different hashes.
 *
 * @param value the object to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const hashObject = (value: object | null, seed = 0): number => {
  if (value === null) return (seed ^ 0x42108422) >>> 0;

  // changes the seed to use the constructor's name
  if (typeof value.constructor === 'function') {
    seed = hashString(value.constructor.name, seed);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: any = value;
  if (typeof obj.hashCode === 'function') {
    return hash(obj.hashCode(), seed);
  } else if (
    typeof obj.valueOf === 'function' &&
    obj.valueOf !== Object.prototype.valueOf
  ) {
    return hash(obj.valueOf(), seed);
  } else if (obj[Symbol.iterator] != null) {
    if (obj instanceof Set) return hashIterableAsSet(obj, seed);
    if (obj instanceof Map) return hashIterableAsMap(obj, seed);
    return hashIterable(obj, seed);
  } else {
    return hashIterableAsMap(Object.entries(obj), seed);
  }
};

/**
 * Hashes an iterable into a unsigned int considering its content. Based on
 * [Murmur3][Murmur3] hashing algorithm. You can also pass a seed to initialize
 * the hashing.
 *
 * [Murmur3]: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
 *
 * @param value the iterable to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export const hashIterable = (value: Iterable<unknown>, seed = 0): number => {
  const arr = Array.from(value, (value) => hash(value, seed));
  return hashArray(arr, seed);
};

/**
 * Hashes an iterable into a unsigned int ignoring the order of the elements.
 * Based on [Murmur3][Murmur3] hashing algorithm. You can also pass a seed to
 * initialize the hashing.
 *
 * [Murmur3]: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
 *
 * @param value the elements iterable to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export const hashIterableAsSet = (
  value: Iterable<unknown>,
  seed = 0
): number => {
  const arr = Array.from(value, (value) => hash(value, seed)).sort();
  return hashArray(arr, seed);
};

/**
 * Hashes an iterable into a unsigned int ignoring the order of the entries.
 * Based on [Murmur3][Murmur3] hashing algorithm. You can also pass a seed to
 * initialize the hashing.
 *
 * [Murmur3]: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
 *
 * @param value the entries iterable to be hashed
 * @param seed a number to start the hashing
 * @returns an unsigned integer
 */
export const hashIterableAsMap = (
  value: Iterable<[unknown, unknown]>,
  seed = 0
): number => {
  const arr = Array.from(value, (value) => hashIterable(value, seed)).sort();
  return hashArray(arr, seed);
};

/**
 * Hashes an array of integers into an unsigned int. Based on [Murmur3][Murmur3]
 * hashing algorithm.
 *
 * [Murmur3]: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
 *
 * @param value the array of hashes to be hashed
 * @param seed the number to start the hashing
 * @returns an unsigned integer
 */
const hashArray = (value: Array<number>, seed: number): number => {
  const len = value.length;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const c3 = 0xe6546b64;
  const c4 = 0x85ebca6b;
  const c5 = 0xc2b2ae35;
  let hashed = seed;
  let k = 0;
  let i = 0;

  while (i < len) {
    k = k ^ value[i++];
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> -15);
    k = Math.imul(k, c2);
    hashed = hashed ^ k;
    hashed = (hashed << 13) | (hashed >>> -13);
    hashed = (Math.imul(hashed, 5) + c3) & 0xffffffff;
  }

  hashed = hashed ^ value.length;

  hashed = hashed ^ (hashed >>> 16);
  hashed = Math.imul(hashed, c4);
  hashed = hashed ^ (hashed >>> 13);
  hashed = Math.imul(hashed, c5);
  hashed = hashed ^ (hashed >>> 16);

  return hashed >>> 0;
};

/**
 * Returns a new seed for the given string.
 *
 * @param str a string to generate a seed
 * @returns an unsigned integer
 */
export const getSeed = (str: string): number => {
  return hashString(str, 0);
};
