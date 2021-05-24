import { expect } from '@esm-bundle/chai';

import { getSeed, hash } from './index';

describe('getSeed tests', () => {
  it('should return a seed', () => {
    const case0 = '';
    const case1 = 'Smile my dear!';
    const case2 = "You know you're not fully dressed without one.";
    expect(getSeed(case0)).equal(0);
    expect(getSeed(case1)).equal(1006794336);
    expect(getSeed(case2)).equal(1364779911);
  });
  it('should return the same seed for the same string', () => {
    const str = 'Smile my dear!';
    expect(getSeed(str)).equal(getSeed(str));
  });
});

describe('hash boolean tests', () => {
  it('should return different hash for "true" e "false"', () => {
    expect(hash(true)).not.equal(hash(false));
  });
  it('should return the same hash for the same value', () => {
    expect(hash(true)).equal(hash(true));
    expect(hash(false)).equal(hash(false));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(true, seed)).not.equal(hash(true));
    expect(hash(false, seed)).not.equal(hash(false));
  });
});

describe('hash number tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(8)).equal(hash(8));
    expect(hash(+0)).equal(hash(-0));
    expect(hash(Math.E)).equal(hash(Math.E));
    expect(hash(10e10)).equal(hash(10e10));
    expect(hash(Number.NaN)).equal(hash(Number.NaN));
    expect(hash(Infinity)).equal(hash(Infinity));
    expect(hash(-Infinity)).equal(hash(-Infinity));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(8, seed)).not.equal(hash(8));
    expect(hash(+0, seed)).not.equal(hash(-0));
    expect(hash(Math.E, seed)).not.equal(hash(Math.E));
    expect(hash(10e10, seed)).not.equal(hash(10e10));
    expect(hash(Number.NaN, seed)).not.equal(hash(Number.NaN));
    expect(hash(Infinity, seed)).not.equal(hash(Infinity));
    expect(hash(-Infinity, seed)).not.equal(hash(-Infinity));
  });
  it('should return a different hash for non-integer numbers', () => {
    expect(hash(Math.E)).not.equal(hash(Math.floor(Math.E)));
    expect(hash(Math.E)).not.equal(hash(Math.ceil(Math.E)));
  });
});

describe('hash string tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash('')).equal(hash(''));
    expect(hash('Smile my dear!')).equal(hash('Smile my dear!'));
    expect(hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀')).equal(
      hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀')
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash('', seed)).not.equal(hash(''));
    expect(hash('Smile my dear!', seed)).not.equal(hash('Smile my dear!'));
    expect(hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀', seed)).not.equal(
      hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀')
    );
  });
  it('should return the same hash equivalent unicode code points', () => {
    // "ñ"
    expect(hash('\u00F1')).equal(hash('\u006E\u0303'));
    // Amélie
    expect(hash('\u0041\u006d\u00e9\u006c\u0069\u0065')).equal(
      hash('\u0041\u006d\u0065\u0301\u006c\u0069\u0065')
    );
  });
});

describe('hash symbol tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(Symbol.iterator)).equal(hash(Symbol.iterator));
    expect(hash(Symbol.match)).equal(hash(Symbol.match));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(Symbol.iterator, seed)).not.equal(hash(Symbol.iterator));
    expect(hash(Symbol.match, seed)).not.equal(hash(Symbol.match));
  });
});

describe('hash function tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(() => void 0)).equal(hash(() => void 0));
    expect(hash(describe)).equal(hash(describe));
    expect(hash(it)).equal(hash(it));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(() => void 0, seed)).not.equal(hash(() => void 0));
    expect(hash(describe, seed)).not.equal(hash(describe));
    expect(hash(it, seed)).not.equal(hash(it));
  });
});

describe('hash object tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(null)).equal(hash(null));
    expect(hash({})).equal(hash({}));
    expect(hash({ a: undefined })).equal(hash({ a: undefined }));
    expect(hash({ a: 1, b: null, c: () => void 0, d: Symbol.match })).equal(
      hash({ b: null, a: 1, c: () => void 0, d: Symbol.match })
    );
    expect(hash(new Date(0))).equal(hash(new Date(0)));
    expect(
      hash({
        hashCode() {
          return 0x811c;
        },
      })
    ).equal(
      hash({
        hashCode() {
          return 0x811c;
        },
      })
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(null, seed)).not.equal(hash(null));
    expect(hash({}, seed)).not.equal(hash({}));
    expect(hash({ a: undefined }, seed)).not.equal(hash({ a: undefined }));
    expect(
      hash({ a: 1, b: null, c: () => void 0, d: Symbol.match }, seed)
    ).not.equal(hash({ b: null, a: 1, c: () => void 0, d: Symbol.match }));
    expect(hash(new Date(0), seed)).not.equal(hash(new Date(0)));
    expect(
      hash(
        {
          hashCode() {
            return 0x9dc5;
          },
        },
        seed
      )
    ).not.equal(
      hash({
        hashCode() {
          return 0x9dc5;
        },
      })
    );
  });
});

describe('hash iterable tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash([1, 2, 3])).equal(hash([1, 2, 3]));
    expect(
      hash([
        ['a', 1],
        ['b', 2],
      ])
    ).equal(
      hash([
        ['a', 1],
        ['b', 2],
      ])
    );
    expect(hash([null, true, 'a'])).equal(hash([null, true, 'a']));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash([1, 2, 3], seed)).not.equal(hash([1, 2, 3]));
    expect(
      hash(
        [
          ['a', 1],
          ['b', 2],
        ],
        seed
      )
    ).not.equal(
      hash([
        ['a', 1],
        ['b', 2],
      ])
    );
    expect(hash([null, true, 'a'], seed)).not.equal(hash([null, true, 'a']));
  });
  it('should return different hash for different orders', () => {
    expect(hash([1, 2, 3])).not.equal(hash([3, 1, 2]));
    expect(
      hash([
        ['a', 1],
        ['b', 2],
      ])
    ).not.equal(
      hash([
        ['b', 2],
        ['a', 1],
      ])
    );
    expect(hash([null, true, 'a'])).not.equal(hash(['a', null, true]));
  });
});

describe('hash set tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(new Set([1, 2, 3]))).equal(hash(new Set([2, 3, 1])));
    expect(
      hash(
        new Set([
          ['a', 1],
          ['b', 2],
        ])
      )
    ).equal(
      hash(
        new Set([
          ['b', 2],
          ['a', 1],
        ])
      )
    );
    expect(hash(new Set([null, true, 'a']))).equal(
      hash(new Set([true, 'a', null]))
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(new Set([1, 2, 3]), seed)).not.equal(hash(new Set([1, 2, 3])));
    expect(
      hash(
        new Set([
          ['a', 1],
          ['b', 2],
        ]),
        seed
      )
    ).not.equal(
      hash(
        new Set([
          ['a', 1],
          ['b', 2],
        ])
      )
    );
    expect(hash(new Set([null, true, 'a']), seed)).not.equal(
      hash(new Set([true, 'a', null]))
    );
  });
});

describe('hash map tests', () => {
  it('should return the same hash for the same value', () => {
    expect(
      hash(
        new Map([
          ['a', 1],
          ['b', 2],
        ])
      )
    ).equal(
      hash(
        new Map([
          ['b', 2],
          ['a', 1],
        ])
      )
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(
      hash(
        new Map([
          ['a', 1],
          ['b', 2],
        ]),
        seed
      )
    ).not.equal(
      hash(
        new Map([
          ['a', 1],
          ['b', 2],
        ])
      )
    );
  });
});
