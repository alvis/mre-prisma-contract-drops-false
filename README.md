# Prisma 8 contract emit drops `false` inside a codec's typeParams

This repository reproduces a bug in `@prisma/orm-framework`: while writing `contract.json`, `omitDefaults` drops every `false` value, empty object and empty array. That includes values inside a column's `typeParams`, which belong to the codec and aren't defaults. Any codec whose parameters can contain `false` therefore reads different parameters at runtime than it was emitted with.

`@prisma/orm-extension-arktype-json` shows it. The column `flag` is `arktypeJson(type('boolean'))`, whose JSON IR is `[{"unit":false},{"unit":true}]`. The emitted `contract.json` stores `[{},{"unit":true}]`, so rehydrating the codec produces a different schema and fails.

## Versions

- `@prisma/orm-postgres` and `@prisma/orm-framework` 8.0.0-rc.24
- `@prisma/orm-extension-arktype-json` 8.0.0-rc.24
- `prisma` 8.0.0-rc.34
- `arktype` 2.2.9

## Reproduction

```sh
npm install
npx prisma contract emit
npm run check
```

`src/check.mjs` reads the column's `typeParams` from `src/generated/contract.json` and calls the codec descriptor's `factory`, as the runtime client does when it builds the codec.

## Expected

`contract.json` keeps `typeParams.jsonIr` as `[{"unit":false},{"unit":true}]`, and the codec rehydrates.

## Actual

```text
schema json IR:   [{"unit":false},{"unit":true}]
contract.json IR: [{},{"unit":true}]
Error [RuntimeError]: arktype-json: typeParams.expression (boolean) does not match the rehydrated schema's expression (unknown). The contract was likely emitted against a different arktype version or hand-edited; re-run `pnpm emit` to regenerate.
```

`prisma contract emit` and `tsc` both succeed. The error appears only when a client is created, so a contract with a boolean anywhere in a typed JSON column passes the build and fails at startup.

## Cause

`isDefaultValue` in `@prisma/orm-framework` (`dist/hashing-*.mjs`) returns `true` for `false`, `[]` and `{}`. `omitDefaults` applies it at every depth of the contract, and its exceptions name only framework paths such as `nullable` and `capabilities`. A codec's `typeParams` is opaque to the framework, so it gets no exception.

## Suggested fix

Have `omitDefaults` copy every `typeParams` subtree unchanged, or treat a codec's parameters as opaque the way `extensions` already is.
