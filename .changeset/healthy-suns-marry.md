---
'cruxhash': major
---

Complete rewrite of the library.

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
