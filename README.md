# CRUXHash

A set of crucial hash functions for ECMAScript.

## Installation

Use the npm package manager to install CRUXHash.

```bash
npm i cruxhash
```

## Usage

CRUXHash provides a set of simple functions to create unsigned integer hashes
for trivial ECMAScript values. See the example bellow:

```js
import { hash, getSeed } from 'cruxhash';

console.log(hash('Smile, my dear!')); // returns 897319059

console.log(hash(42, getSeed('my seed'))); // returns 1866919164

console.log(hash({ a: 10, b: 10 })); // returns 3426884542

console.log(hash([1, 2, 3])); // returns 149610452

console.log(hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀')); // returns 1149923829
```

## API

### `hash(value: unknown, seed?: number)`

Hashes an value into a unsigned int. You can also pass a seed to initialize
the hashing. It handles most of trivial ECMAScript values and delegates for
a specialized hash function.

### `hashBoolean(value: boolean, seed?: number)`

Hashes a boolean into a unsigned int. Guarantees different results for the
`true` and `false`. You can also pass a seed to initialize the hashing.

### `hashNumber(value: number, seed?: number)`

Hashes an arbitrary number into a unsigned int. Based on [Thomas Wang's 7-shift
integer hash algorithm][Wang]. Provides support for `NaN`, `Infinity` and
`-Infinity`. You can also pass a seed to initialize the hashing.

### `hashString(value: string, seed?: number)`

Hashes a string into a unsigned int. Based on [Murmur3][Murmur3] hashing
algorithm. You can also pass a seed to initialize the hashing.

### `hashSymbol(value: symbol, seed?: number)`

Hashes a symbol into a unsigned int considering its string representation. You
can also pass a seed to initialize the hashing.

### `hashFunction(value: Function, seed?: number)`

Hashes a function into a unsigned int considering its string representation. You
can also pass a seed to initialize the hashing.

### `hashObject(value: object | null, seed?: number)`

Hashes an object value into a unsigned int considering:

- If it is `null`, returns a fixed value.
- If it has a `hashCode`, returns `hash(obj.hashCode(), seed)`;
- If it has an overwritten `valueOf`, returns `hash(obj.valueOf(), seed)`;
- If it has a `Symbol.iterator` and:
  - is an instance of `Set`, returns `hashIterableAsSet(obj, seed)`
  - is an instance of `Map`, returns `hashIterableAsMap(obj, seed)`
  - otherwise, returns `hashIterable(obj, seed)`
- Otherwise, returns `hashIterableAsMap(Object.entries(obj))`.

### `hashIterable(value: Iterable<unknown>, seed?: number)`

Hashes an iterable into a unsigned int considering its content. Based on
[Murmur3][Murmur3] hashing algorithm. You can also pass a seed to initialize the
hashing.

### `hashIterableAsSet(value: Iterable<unknown>, seed?: number)`

Hashes an iterable into a unsigned int ignoring the order of the elements. Based
on [Murmur3][Murmur3] hashing algorithm. You can also pass a seed to initialize
the hashing.

### `hashIterableAsMap(value: Iterable<[unknown, unknown]>, seed?: number)`

Hashes an iterable into a unsigned int ignoring the order of the entries. Based
on [Murmur3][Murmur3] hashing algorithm. You can also pass a seed to initialize
the hashing.

### `getSeed(str: string)`

Returns a seed for the given string.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to
discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://maxroecker.mit-license.org/)

[Wang]: http://burtleburtle.net/bob/hash/integer.html
[Murmur3]: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
