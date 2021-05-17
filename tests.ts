import { getSeed, hash } from './index';

describe('getSeed tests', () => {
  it('should return a seed', () => {
    const case0 = '';
    const case1 = 'Smile my dear!';
    const case2 = "You know you're not fully dressed without one.";
    expect(getSeed(case0)).toStrictEqual(0);
    expect(getSeed(case1)).toStrictEqual(1006794336);
    expect(getSeed(case2)).toStrictEqual(1364779911);
  });
  it('should return the same seed for the same string', () => {
    const str = 'Smile my dear!';
    expect(getSeed(str)).toStrictEqual(getSeed(str));
  });
});

describe('hash boolean tests', () => {
  it('should return different hash for "true" e "false"', () => {
    expect(hash(true)).not.toBe(hash(false));
  });
  it('should return the same hash for the same value', () => {
    expect(hash(true)).toBe(hash(true));
    expect(hash(false)).toBe(hash(false));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(true, seed)).not.toBe(hash(true));
    expect(hash(false, seed)).not.toBe(hash(false));
  });
});

describe('hash number tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(8)).toBe(hash(8));
    expect(hash(+0)).toBe(hash(-0));
    expect(hash(10e10)).toBe(hash(10e10));
    expect(hash(Number.NaN)).toBe(hash(Number.NaN));
    expect(hash(Infinity)).toBe(hash(Infinity));
    expect(hash(-Infinity)).toBe(hash(-Infinity));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(8, seed)).not.toBe(hash(8));
    expect(hash(+0, seed)).not.toBe(hash(-0));
    expect(hash(10e10, seed)).not.toBe(hash(10e10));
    expect(hash(Number.NaN, seed)).not.toBe(hash(Number.NaN));
    expect(hash(Infinity, seed)).not.toBe(hash(Infinity));
    expect(hash(-Infinity, seed)).not.toBe(hash(-Infinity));
  });
});

describe('hash string tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash('')).toBe(hash(''));
    expect(hash('Smile my dear!')).toBe(hash('Smile my dear!'));
    expect(hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀')).toBe(
      hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀')
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash('', seed)).not.toBe(hash(''));
    expect(hash('Smile my dear!', seed)).not.toBe(hash('Smile my dear!'));
    expect(hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀', seed)).not.toBe(
      hash('コンニチハ, Hello world, Καλημέρα κόσμε 😀')
    );
  });
  it('should return the same hash equivalent unicode code points', () => {
    // "ñ"
    expect(hash('\u00F1')).toBe(hash('\u006E\u0303'));
    // Amélie
    expect(hash('\u0041\u006d\u00e9\u006c\u0069\u0065')).toBe(
      hash('\u0041\u006d\u0065\u0301\u006c\u0069\u0065')
    );
  });
});

describe('hash symbol tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(Symbol.iterator)).toBe(hash(Symbol.iterator));
    expect(hash(Symbol.match)).toBe(hash(Symbol.match));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(Symbol.iterator, seed)).not.toBe(hash(Symbol.iterator));
    expect(hash(Symbol.match, seed)).not.toBe(hash(Symbol.match));
  });
});

describe('hash function tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(() => void 0)).toBe(hash(() => void 0));
    expect(hash(describe)).toBe(hash(describe));
    expect(hash(it)).toBe(hash(it));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(() => void 0, seed)).not.toBe(hash(() => void 0));
    expect(hash(describe, seed)).not.toBe(hash(describe));
    expect(hash(it, seed)).not.toBe(hash(it));
  });
});

describe('hash object tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(null)).toBe(hash(null));
    expect(hash({})).toBe(hash({}));
    expect(hash({ a: undefined })).toBe(hash({ a: undefined }));
    expect(hash({ a: 1, b: null, c: () => void 0, d: Symbol.match })).toBe(
      hash({ b: null, a: 1, c: () => void 0, d: Symbol.match })
    );
    expect(hash(new Date(0))).toBe(hash(new Date(0)));
    expect(
      hash({
        hashCode() {
          return 0x811c;
        },
      })
    ).toBe(
      hash({
        hashCode() {
          return 0x811c;
        },
      })
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(null, seed)).not.toBe(hash(null));
    expect(hash({}, seed)).not.toBe(hash({}));
    expect(hash({ a: undefined }, seed)).not.toBe(hash({ a: undefined }));
    expect(
      hash({ a: 1, b: null, c: () => void 0, d: Symbol.match }, seed)
    ).not.toBe(hash({ b: null, a: 1, c: () => void 0, d: Symbol.match }));
    expect(hash(new Date(0), seed)).not.toBe(hash(new Date(0)));
    expect(
      hash(
        {
          hashCode() {
            return 0x9dc5;
          },
        },
        seed
      )
    ).not.toBe(
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
    expect(hash([1, 2, 3])).toBe(hash([1, 2, 3]));
    expect(
      hash([
        ['a', 1],
        ['b', 2],
      ])
    ).toBe(
      hash([
        ['a', 1],
        ['b', 2],
      ])
    );
    expect(hash([null, true, 'a'])).toBe(hash([null, true, 'a']));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash([1, 2, 3], seed)).not.toBe(hash([1, 2, 3]));
    expect(
      hash(
        [
          ['a', 1],
          ['b', 2],
        ],
        seed
      )
    ).not.toBe(
      hash([
        ['a', 1],
        ['b', 2],
      ])
    );
    expect(hash([null, true, 'a'], seed)).not.toBe(hash([null, true, 'a']));
  });
  it('should return different hash for different orders', () => {
    expect(hash([1, 2, 3])).not.toBe(hash([3, 1, 2]));
    expect(
      hash([
        ['a', 1],
        ['b', 2],
      ])
    ).not.toBe(
      hash([
        ['b', 2],
        ['a', 1],
      ])
    );
    expect(hash([null, true, 'a'])).not.toBe(hash(['a', null, true]));
  });
});

describe('hash set tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(new Set([1, 2, 3]))).toBe(hash(new Set([2, 3, 1])));
    expect(
      hash(
        new Set([
          ['a', 1],
          ['b', 2],
        ])
      )
    ).toBe(
      hash(
        new Set([
          ['b', 2],
          ['a', 1],
        ])
      )
    );
    expect(hash(new Set([null, true, 'a']))).toBe(
      hash(new Set([true, 'a', null]))
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(new Set([1, 2, 3]), seed)).not.toBe(hash(new Set([1, 2, 3])));
    expect(
      hash(
        new Set([
          ['a', 1],
          ['b', 2],
        ]),
        seed
      )
    ).not.toBe(
      hash(
        new Set([
          ['a', 1],
          ['b', 2],
        ])
      )
    );
    expect(hash(new Set([null, true, 'a']), seed)).not.toBe(
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
    ).toBe(
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
    ).not.toBe(
      hash(
        new Map([
          ['a', 1],
          ['b', 2],
        ])
      )
    );
  });
});
