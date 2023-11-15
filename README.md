# CRUXHash

[![View on NPM](https://img.shields.io/npm/v/cruxhash?style=flat-square)](https://www.npmjs.com/package/cruxhash)
[![License](https://img.shields.io/npm/l/cruxhash?style=flat-square)](https://maxroecker.mit-license.org/)

A set of crucial hash functions for ECMAScript.

## Installation

Use the npm package manager to install CRUXHash.

```bash
npm i cruxhash
```

## Usage

CRUXHash provides a set of simple functions to create unsigned 32-bit integer
hash codes for trivial ECMAScript values. See the example bellow:

```js
import { hash, getSeed } from 'cruxhash';

console.log(hash('Smile, my dear!')); // returns 2890382619

console.log(hash(42)); // returns 1462734105

console.log(hash(42, getSeed('my seed'))); // returns 8142968

console.log(hash({ a: 10, b: 10 })); // returns 3685477545

console.log(hash([1, 2, 3])); // returns 2610324319

console.log(hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀')); // returns 1898574527
```

Most of times, the function [`hash`][hash] is sufficient for making the hash
codes. If you need some tampering, pass a number to the `seed` parameter to
start the hash algorithm. You can use the the [`getSeed`][getSeed] function to
generate some seeds from strings. Other functions are available, see the
[Wiki's Page][Wiki] for the complete API.

CRUXHash uses [Murmur3][Murmur3] as the hashing algorithm in most of cases, the
exception is when hashing 32bit integers, where it uses [Thomas Wang's][Wang]
shift and multiplication algorithm.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to
discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://maxroecker.mit-license.org/)

[Wang]: http://web.archive.org/web/20071223173210/http://www.concentric.net/~Ttwang/tech/inthash.htm
[Murmur3]: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
[Wiki]: https://github.com/MaxRoecker/cruxhash/wiki
[hash]: https://github.com/MaxRoecker/cruxhash/wiki#hash
[getSeed]: https://github.com/MaxRoecker/cruxhash/wiki#getseed
