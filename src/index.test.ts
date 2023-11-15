import { describe, expect, it } from 'bun:test';
import { getSeed, hash } from './index';

describe('getSeed', () => {
  it('should return a seed', () => {
    const case0 = '';
    const case1 = 'Smile my dear!';
    const case2 = "You know you're not fully dressed without one.";
    expect(getSeed(case0)).toBe(0);
    expect(getSeed(case1)).toBe(2021251023);
    expect(getSeed(case2)).toBe(3695890359);
  });
  it('should return the same seed for the same string', () => {
    const str = 'Smile my dear!';
    expect(getSeed(str)).toBe(getSeed(str));
  });
});

describe('hash boolean', () => {
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

describe('hash number', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(42)).toBe(hash(42));
    expect(hash(+0)).toBe(hash(-0));
    expect(hash(0xffffffff)).toBe(hash(0xffffffff));
    expect(hash(Math.E)).toBe(hash(Math.E));
    expect(hash(10e10)).toBe(hash(10e10));
    expect(hash(Number.NaN)).toBe(hash(Number.NaN));
    expect(hash(Infinity)).toBe(hash(Infinity));
    expect(hash(-Infinity)).toBe(hash(-Infinity));
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(42, seed)).not.toBe(hash(42));
    expect(hash(+0, seed)).not.toBe(hash(-0));
    expect(hash(0xffffffff, seed)).not.toBe(hash(0xffffffff));
    expect(hash(Math.E, seed)).not.toBe(hash(Math.E));
    expect(hash(10e10, seed)).not.toBe(hash(10e10));
    expect(hash(Number.NaN, seed)).not.toBe(hash(Number.NaN));
    expect(hash(Infinity, seed)).not.toBe(hash(Infinity));
    expect(hash(-Infinity, seed)).not.toBe(hash(-Infinity));
  });
  it('should return a different hash for non-integer numbers', () => {
    expect(hash(Math.E)).not.toBe(hash(Math.floor(Math.E)));
    expect(hash(Math.E)).not.toBe(hash(Math.ceil(Math.E)));
  });
});

describe('hash string', () => {
  it('should return the same hash for the same value', () => {
    const case0 = '';
    const case1 = 'Smile my dear!';
    const case2 = 'コンニチハ, Hello world, Καλημέρα κόσμε 😀';
    expect(hash(case0)).toBe(hash(case0));
    expect(hash(case1)).toBe(hash(case1));
    expect(hash(case2)).toBe(hash(case2));
  });
  it('should return different hash for different seeds', () => {
    const case0 = '';
    const case1 = 'Smile my dear!';
    const case2 = 'コンニチハ, Hello world, Καλημέρα κόσμε 😀';
    const seed = 0x9dc5811c;
    expect(hash(case0, seed)).not.toBe(hash(case0));
    expect(hash(case1, seed)).not.toBe(hash(case1));
    expect(hash(case2, seed)).not.toBe(hash(case2));
  });
  it('should return the same hash equivalent unicode code points', () => {
    const case0 = { nfc: '\u00F1', nfd: '\u006E\u0303' }; // "ñ"
    const case1 = { nfc: '\u1EBF', nfd: '\u0065\u0302\u0301' }; // "ế"
    const case2 = { nfc: 'Am\u00e9lie', nfd: 'Am\u0065\u0301lie' }; // "Amélie
    expect(hash(case0.nfc)).toBe(hash(case0.nfd));
    expect(hash(case1.nfc)).toBe(hash(case1.nfd));
    expect(hash(case2.nfc)).toBe(hash(case2.nfd));
  });
});

describe('hash bigint', () => {
  it('should return the same hash for the same value', () => {
    const big = 10000000000000000000000000000000000000n;
    expect(hash(0n)).toBe(hash(-0n));
    expect(hash(8n)).toBe(hash(8n));
    expect(hash(big)).toBe(hash(big));
  });
  it('should return different hash for different seeds', () => {
    const big = 10000000000000000000000000000000000000n;
    const seed = 0x9dc5811c;
    expect(hash(0n, seed)).not.toBe(hash(-0n));
    expect(hash(8n, seed)).not.toBe(hash(8n));
    expect(hash(big, seed)).not.toBe(hash(big));
  });
});

describe('hash symbol', () => {
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

describe('hash function', () => {
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

describe('hash object', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(null)).toBe(hash(null));
    expect(hash({})).toBe(hash({}));
    expect(hash({ a: undefined })).toBe(hash({ a: undefined }));
    expect(hash({ a: 1, b: null, c: () => void 0, d: Symbol.match })).toBe(
      hash({ b: null, a: 1, c: () => void 0, d: Symbol.match }),
    );
    expect(hash(new Date(0))).toBe(hash(new Date(0)));
    expect(
      hash({
        hashCode() {
          return 0x811c;
        },
      }),
    ).toBe(
      hash({
        hashCode() {
          return 0x811c;
        },
      }),
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hash(null, seed)).not.toBe(hash(null));
    expect(hash({}, seed)).not.toBe(hash({}));
    expect(hash({ a: undefined }, seed)).not.toBe(hash({ a: undefined }));
    expect(
      hash({ a: 1, b: null, c: () => void 0, d: Symbol.match }, seed),
    ).not.toBe(hash({ b: null, a: 1, c: () => void 0, d: Symbol.match }));
    expect(hash(new Date(0), seed)).not.toBe(hash(new Date(0)));
    expect(
      hash(
        {
          hashCode() {
            return 0x9dc5;
          },
        },
        seed,
      ),
    ).not.toBe(
      hash({
        hashCode() {
          return 0x9dc5;
        },
      }),
    );
  });
});

describe('hash sequence', () => {
  it('should return the same hash for the same value', () => {
    expect(hash([1, 2, 3])).toBe(hash([1, 2, 3]));
    expect(
      hash([
        ['a', 1],
        ['b', 2],
      ]),
    ).toBe(
      hash([
        ['a', 1],
        ['b', 2],
      ]),
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
        seed,
      ),
    ).not.toBe(
      hash([
        ['a', 1],
        ['b', 2],
      ]),
    );
    expect(hash([null, true, 'a'], seed)).not.toBe(hash([null, true, 'a']));
  });
  it('should return different hash for different orders', () => {
    expect(hash([1, 2, 3])).not.toBe(hash([3, 1, 2]));
    expect(
      hash([
        ['a', 1],
        ['b', 2],
      ]),
    ).not.toBe(
      hash([
        ['b', 2],
        ['a', 1],
      ]),
    );
    expect(hash([null, true, 'a'])).not.toBe(hash(['a', null, true]));
  });
});

describe('hash values', () => {
  it('should return the same hash for the same value', () => {
    expect(hash(new Set([1, 2, 3]))).toBe(hash(new Set([2, 3, 1])));
    expect(
      hash(
        new Set([
          ['a', 1],
          ['b', 2],
        ]),
      ),
    ).toBe(
      hash(
        new Set([
          ['b', 2],
          ['a', 1],
        ]),
      ),
    );
    expect(hash(new Set([null, true, 'a']))).toBe(
      hash(new Set([true, 'a', null])),
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
        seed,
      ),
    ).not.toBe(
      hash(
        new Set([
          ['a', 1],
          ['b', 2],
        ]),
      ),
    );
    expect(hash(new Set([null, true, 'a']), seed)).not.toBe(
      hash(new Set([true, 'a', null])),
    );
  });
});

describe('hash entries', () => {
  it('should return the same hash for the same value', () => {
    expect(
      hash(
        new Map([
          ['a', 1],
          ['b', 2],
        ]),
      ),
    ).toBe(
      hash(
        new Map([
          ['b', 2],
          ['a', 1],
        ]),
      ),
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
        seed,
      ),
    ).not.toBe(
      hash(
        new Map([
          ['a', 1],
          ['b', 2],
        ]),
      ),
    );
  });
});
