import {
  getSeed,
  hashBoolean,
  hashNumber,
  hashString,
  hashSymbol,
  hashFunction,
  hashIterable,
  hashIterableAsSet,
  hashIterableAsMap,
  hashObject,
} from './index';

describe('getSeed tests', () => {
  it('should return a pair of numbers', () => {
    const case0 = '';
    const case1 = 'Smile my dear!';
    const case2 = "You know you're not fully dressed without one.";
    expect(getSeed(case0)).toStrictEqual(2166136261);
    expect(getSeed(case1)).toStrictEqual(4099022340);
    expect(getSeed(case2)).toStrictEqual(1772705831);
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
    const seed = 0x9dc5811c;
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
    const seed = 0x9dc5811c;
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
    const seed = 0x9dc5811c;
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
    const seed = 0x9dc5811c;
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
    const seed = 0x9dc5811c;
    expect(hashFunction(() => void 0, seed)).not.toBe(
      hashFunction(() => void 0)
    );
    expect(hashFunction(describe, seed)).not.toBe(hashFunction(describe));
    expect(hashFunction(it, seed)).not.toBe(hashFunction(it));
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
    const seed = 0x9dc5811c;
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
    const seed = 0x9dc5811c;
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

describe('hashIterable tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hashIterable([1, 2, 3])).toBe(hashIterable([1, 2, 3]));
    expect(
      hashIterable([
        ['a', 1],
        ['b', 2],
      ])
    ).toBe(
      hashIterable([
        ['a', 1],
        ['b', 2],
      ])
    );
    expect(hashIterable([null, true, 'a'])).toBe(
      hashIterable([null, true, 'a'])
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hashIterable([1, 2, 3], seed)).not.toBe(hashIterable([1, 2, 3]));
    expect(
      hashIterable(
        [
          ['a', 1],
          ['b', 2],
        ],
        seed
      )
    ).not.toBe(
      hashIterable([
        ['a', 1],
        ['b', 2],
      ])
    );
    expect(hashIterable([null, true, 'a'], seed)).not.toBe(
      hashIterable([null, true, 'a'])
    );
  });
  it('should return different hash for different orders', () => {
    expect(hashIterable([1, 2, 3])).not.toBe(hashIterable([3, 1, 2]));
    expect(
      hashIterable([
        ['a', 1],
        ['b', 2],
      ])
    ).not.toBe(
      hashIterable([
        ['b', 2],
        ['a', 1],
      ])
    );
    expect(hashIterable([null, true, 'a'])).not.toBe(
      hashIterable(['a', null, true])
    );
  });
});

describe('hashIterableSet tests', () => {
  it('should return the same hash for the same value', () => {
    expect(hashIterableAsSet([1, 2, 3])).toBe(hashIterableAsSet([1, 2, 3]));
    expect(
      hashIterableAsSet([
        ['a', 1],
        ['b', 2],
      ])
    ).toBe(
      hashIterableAsSet([
        ['a', 1],
        ['b', 2],
      ])
    );
    expect(hashIterableAsSet([null, true, 'a'])).toBe(
      hashIterableAsSet([null, true, 'a'])
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(hashIterableAsSet([1, 2, 3], seed)).not.toBe(
      hashIterableAsSet([1, 2, 3])
    );
    expect(
      hashIterableAsSet(
        [
          ['a', 1],
          ['b', 2],
        ],
        seed
      )
    ).not.toBe(
      hashIterableAsSet([
        ['a', 1],
        ['b', 2],
      ])
    );
    expect(hashIterableAsSet([null, true, 'a'], seed)).not.toBe(
      hashIterableAsSet([null, true, 'a'])
    );
  });
  it('should return the same hash for different orders', () => {
    expect(hashIterableAsSet([1, 2, 3])).toBe(hashIterableAsSet([3, 1, 2]));
    expect(
      hashIterableAsSet([
        ['a', 1],
        ['b', 2],
      ])
    ).toBe(
      hashIterableAsSet([
        ['b', 2],
        ['a', 1],
      ])
    );
    expect(hashIterableAsSet([null, true, 'a'])).toBe(
      hashIterableAsSet(['a', null, true])
    );
  });
});

describe('hashIterableMap tests', () => {
  it('should return the same hash for the same value', () => {
    expect(
      hashIterableAsMap([
        ['a', 1],
        ['b', 2],
      ])
    ).toBe(
      hashIterableAsMap([
        ['a', 1],
        ['b', 2],
      ])
    );
  });
  it('should return different hash for different seeds', () => {
    const seed = 0x9dc5811c;
    expect(
      hashIterableAsMap(
        [
          ['a', 1],
          ['b', 2],
        ],
        seed
      )
    ).not.toBe(
      hashIterableAsMap([
        ['a', 1],
        ['b', 2],
      ])
    );
  });
  it('should return the same hash for different orders', () => {
    expect(
      hashIterableAsMap([
        ['a', 1],
        ['b', 2],
      ])
    ).toBe(
      hashIterableAsMap([
        ['b', 2],
        ['a', 1],
      ])
    );
  });
});
