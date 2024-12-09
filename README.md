<div align="center">
  <h1>trpc-openapi-2</h1>
  <a href="https://www.npmjs.com/package/trpc-openapi-2"><img src="https://img.shields.io/npm/v/trpc-openapi-2.svg?style=flat&color=brightgreen" target="_blank" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-black" /></a>
  <br />
  <hr />
</div>

---

## Generate an OpenAPI spec from your tRPC server, in one line of code

### Step 1: Install `trpc-openapi-2`

```
# npm
npm install trpc-openapi-2

# yarn
yarn install trpc-openapi-2

# pnpm
pnpm install trpc-openapi-2
```

### Step 2: Generate OpenAPI spec

```typescript
import { trpcToOpenApi } from "trpc-openapi-2";

// generate OpenAPI spec
const openApiSpec = trpcToOpenApi({
  apiTitle: "Your API",
  apiVersion: "1.0.0",
  basePath: "/trpc",
  router: trpcRouter,
});

// express example: serve openapi spec at /openapi.json
app.get("/openapi.json", (_, res) => res.json(openApiSpec));
```

## Excluding certain procedures

### Step 1: Add `OpenApiMeta` to your `initTRPC` call:

```typescript
import { OpenApiMeta } from "trpc-openapi-2";

const t = initTRPC.meta<OpenApiMeta>().create();
```

### Step 2: Use .meta() in your procedure

```typescript
const router = t.router({
  myProcedure: t.procedure
    .meta({ openapi: { ignore: true } }) // add this
    .input(...
});
```
