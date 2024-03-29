# cruxhash

## 2.1.1

### Patch Changes

- 7716485: Update dependencies
- 6456cfa: Add ignore-sync and type checking

## 2.1.0

### Minor Changes

- 4ef7d7b: Add hashBytes function

### Patch Changes

- 05bd759: Use NFD on string normalization
- a7565d2: Improve test readability

## 2.0.3

### Patch Changes

- df88287: Fix dependencies

## 2.0.2

### Patch Changes

- d4da6c1: Fix action workflow

## 2.0.1

### Patch Changes

- fb4db77: Changes on worflows

## 2.0.0

### Major Changes

- 88112c0: Complete rewrite of the library.

  ## Added

  - Adds support to BigInts;
  - Rewrite to use binary data structures.

  ## Fixes

  - Fix the hashing algorithm to avoid losing information when handling integer
    values greater than 2^32-1.

  ## Breaking changes

  - To support BigInts, CruxHash now targets ES2020 and does not support previous
    versions.
  - If you already targets ES2020, no changes are required.
  - Changes on the hash core are expected on this version.
