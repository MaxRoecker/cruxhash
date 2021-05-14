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

console.log(hash('Smile, my dear!')); // returns 2630677830

console.log(hash(42, getSeed('my seed'))); // returns 1833929388

console.log(hash({ a: 10, b: 10 })); // returns 2072876308

console.log(hash([1, 2, 3])); // returns 2122060211

console.log(hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀')); // returns 1672729357
```

## API

### `hash(value: unknown, seed?: number)`

Hashes an value into a unsigned int. You can also pass an seed to initialize the
hashing. It handles most of trivial ECMAScript values and delegates for a
specialized hash function bellow.

### `hashBoolean(value: boolean, seed?: number)`

Hashes a boolean into a unsigned int. Guarantees different results for the
`true` and `false`. You can also pass a seed to initialize the hashing.

### `hashNumber(value: number, seed?: number)`

Hashes a number into a unsigned int. Based on
[Thomas Wang's 7-shift integer hash algorithm](http://burtleburtle.net/bob/hash/integer.html).
Provides support for `NaN`, `Infinity` and `-Infinity`. You can also pass a seed
to initialize the hashing.

### `hashString(value: string, seed?: number)`

Hashes a string into a unsigned int. Based on
[FNV-1a Hashing algorithm](http://www.isthe.com/chongo/tech/comp/fnv/index.html).
Provides support for unicode strings. You can also pass a seed to initialize the
hashing.

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
- If it has a `Symbol.iterator`, returns `hashIterable(obj, seed)`;
- Otherwise, returns `hashIterableAsMap(Object.entries(obj))`.

### `hashIterable(value: Iterable<unknown>, seed?: number)`

Hashes an iterable into a unsigned int considering its content. Based on
[FNV-1a Hashing algorithm](http://www.isthe.com/chongo/tech/comp/fnv/index.html)
where each element of the iterable is hashed with `hash`.

### `hashIterableAsSet(value: Iterable<unknown>, seed?: number)`

Hashes an iterable into a unsigned int ignoring the order of the elements. Based
on
[FNV-1a Hashing algorithm](http://www.isthe.com/chongo/tech/comp/fnv/index.html)
where each element is hashed with `hash`. You can also pass a seed to initialize
the hashing.

### `hashIterableAsMap(value: Iterable<[unknown, unknown]>, seed?: number)`

Hashes an iterable into a unsigned int ignoring the order of the entries. Based
on
[FNV-1a Hashing algorithm](http://www.isthe.com/chongo/tech/comp/fnv/index.html)
where each entry of is hashed with `hashIterable`. You can also pass a seed to
initialize the hashing.

### `getSeed(str: string)`

Returns a seed for the given string.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://maxroecker.mit-license.org/)
