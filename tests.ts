import type { Seed } from './index';
import {
  getSeed,
  hashBoolean,
  hashNumber,
  hashString,
  hashSymbol,
  hashFunction,
  hashIterable,
  hashObject,
} from './index';

describe('getSeed tests', () => {
  it('should return a pair of numbers', () => {
    const case0 = '';
    const case1 = 'Smile my dear!';
    const case2 = "You know you're not fully dressed without one.";
    expect(getSeed(case0)).toStrictEqual([0x811c, 0x9dc5]);
    expect(getSeed(case1)).toStrictEqual([0xf452, 0x1e04]);
    expect(getSeed(case2)).toStrictEqual([0x69a9, 0x5827]);
  });
  it('should return the same seed for the same string', () => {
    const str = 'Smile my dear!';
    expect(getSeed(str)).toStrictEqual(getSeed(str));
  });
});

describe('hashBoolean tests', () => {
  it('should return different hash for "true" e "false"', () => {
    expect(hashBoolean(true)).not.toBe(hashBoolean(false));
  });
  it('should return the same hash for the same value', () => {
    expect(hashBoolean(true)).toBe(hashBoolean(true));
    expect(hashBoolean(false)).toBe(hashBoolean(false));
  });
  it('should return different hash for different seeds', () => {
    const seed: Seed = [0x811c, 0x9dc5];
    expect(hashBoolean(true, seed)).not.toBe(hashBoolean(true));
    expect(hashBoolean(false, seed)).not.toBe(hashBoolean(false));
  });
});

describe('hashNumber tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hashNumber(8)).toBe(hashNumber(8));
    expect(hashNumber(+0)).toBe(hashNumber(-0));
    expect(hashNumber(10e10)).toBe(hashNumber(10e10));
    expect(hashNumber(Number.NaN)).toBe(hashNumber(Number.NaN));
    expect(hashNumber(Infinity)).toBe(hashNumber(Infinity));
    expect(hashNumber(-Infinity)).toBe(hashNumber(-Infinity));
  });
  it('should return different hash for different seeds', () => {
    const seed: Seed = [0x811c, 0x9dc5];
    expect(hashNumber(8, seed)).not.toBe(hashNumber(8));
    expect(hashNumber(+0, seed)).not.toBe(hashNumber(-0));
    expect(hashNumber(10e10, seed)).not.toBe(hashNumber(10e10));
    expect(hashNumber(Number.NaN, seed)).not.toBe(hashNumber(Number.NaN));
    expect(hashNumber(Infinity, seed)).not.toBe(hashNumber(Infinity));
    expect(hashNumber(-Infinity, seed)).not.toBe(hashNumber(-Infinity));
  });
});

describe('hashString tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hashString('')).toBe(hashString(''));
    expect(hashString('Smile my dear!')).toBe(hashString('Smile my dear!'));
    expect(hashString('コンニチハ, Hello world, Καλημέρα κόσμε 😀')).toBe(
      hashString('コンニチハ, Hello world, Καλημέρα κόσμε 😀')
    );
  });
  it('should return different hash for different seeds', () => {
    const seed: Seed = [0x811c, 0x9dc5];
    expect(hashString('', seed)).not.toBe(hashString(''));
    expect(hashString('Smile my dear!', seed)).not.toBe(
      hashString('Smile my dear!')
    );
    expect(
      hashString('コンニチハ, Hello world, Καλημέρα κόσμε 😀', seed)
    ).not.toBe(hashString('コンニチハ, Hello world, Καλημέρα κόσμε 😀'));
  });
});

describe('hashSymbol tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hashSymbol(Symbol.iterator)).toBe(hashSymbol(Symbol.iterator));
    expect(hashSymbol(Symbol.match)).toBe(hashSymbol(Symbol.match));
  });
  it('should return different hash for different seeds', () => {
    const seed: Seed = [0x811c, 0x9dc5];
    expect(hashSymbol(Symbol.iterator, seed)).not.toBe(
      hashSymbol(Symbol.iterator)
    );
    expect(hashSymbol(Symbol.match, seed)).not.toBe(hashSymbol(Symbol.match));
  });
});

describe('hashFunction tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hashFunction(() => void 0)).toBe(hashFunction(() => void 0));
    expect(hashFunction(describe)).toBe(hashFunction(describe));
    expect(hashFunction(it)).toBe(hashFunction(it));
  });
  it('should return different hash for different seeds', () => {
    const seed: Seed = [0x811c, 0x9dc5];
    expect(hashFunction(() => void 0, seed)).not.toBe(
      hashFunction(() => void 0)
    );
    expect(hashFunction(describe, seed)).not.toBe(hashFunction(describe));
    expect(hashFunction(it, seed)).not.toBe(hashFunction(it));
  });
});

describe('hashIterable tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hashIterable([1, 2, 3])).toBe(hashIterable([1, 2, 3]));
    expect(
      hashIterable(
        new Map([
          ['a', 1],
          ['b', 2],
        ])
      )
    ).toBe(
      hashIterable(
        new Map([
          ['a', 1],
          ['b', 2],
        ])
      )
    );
    expect(hashIterable(new Set([null, true, 'a']))).toBe(
      hashIterable(new Set([null, true, 'a']))
    );
  });
  it('should return different hash for different seeds', () => {
    const seed: Seed = [0x811c, 0x9dc5];
    expect(hashIterable([1, 2, 3], seed)).not.toBe(hashIterable([1, 2, 3]));
    expect(
      hashIterable(
        new Map([
          ['a', 1],
          ['b', 2],
        ]),
        seed
      )
    ).not.toBe(
      hashIterable(
        new Map([
          ['a', 1],
          ['b', 2],
        ])
      )
    );
    expect(hashIterable(new Set([null, true, 'a']), seed)).not.toBe(
      hashIterable(new Set([null, true, 'a']))
    );
  });
});

describe('hashObject tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hashObject(null)).toBe(hashObject(null));
    expect(hashObject({})).toBe(hashObject({}));
    expect(hashObject({ a: undefined })).toBe(hashObject({ a: undefined }));
    expect(
      hashObject({ a: 1, b: null, c: () => void 0, d: Symbol.match })
    ).toBe(hashObject({ b: null, a: 1, c: () => void 0, d: Symbol.match }));
    expect(hashObject(new Date(0))).toBe(hashObject(new Date(0)));
  });
  it('should return different hash for different seeds', () => {
    const seed: Seed = [0x811c, 0x9dc5];
    expect(hashObject(null, seed)).not.toBe(hashObject(null));
    expect(hashObject({}, seed)).not.toBe(hashObject({}));
    expect(hashObject({ a: undefined }, seed)).not.toBe(
      hashObject({ a: undefined })
    );
    expect(
      hashObject({ a: 1, b: null, c: () => void 0, d: Symbol.match }, seed)
    ).not.toBe(hashObject({ b: null, a: 1, c: () => void 0, d: Symbol.match }));
    expect(hashObject(new Date(0), seed)).not.toBe(hashObject(new Date(0)));
  });
  it('should consider the hashCode method', () => {
    const seed: Seed = [0x811c, 0x9dc5];
    expect(
      hashObject({
        hashCode() {
          return 0x811c;
        },
      })
    ).toBe(
      hashObject({
        hashCode() {
          return 0x811c;
        },
      })
    );
    expect(
      hashObject(
        {
          hashCode() {
            return 0x9dc5;
          },
        },
        seed
      )
    ).toBe(
      hashObject({
        hashCode() {
          return 0x9dc5;
        },
      })
    );
    expect(
      hashObject(
        {
          hashCode() {
            return 0x811c;
          },
        },
        seed
      )
    ).not.toBe(
      hashObject({
        hashCode() {
          return 0x9dc5;
        },
      })
    );
  });
});
