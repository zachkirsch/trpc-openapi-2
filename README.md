<div align="center">
  <h1>trpc-openapi-2</h1>
  <a href="https://www.npmjs.com/package/trpc-openapi-2"><img src="https://img.shields.io/npm/v/trpc-openapi-2.svg?style=flat&color=brightgreen" target="_blank" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-black" /></a>
</div>

---

## Generate an OpenAPI spec from your tRPC server, in one line of code

### Step 1: Install `trpc-openapi-2`

```bash
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

## Configuring the OpenAPI spec

### Excluding certain procedures

#### Step 1: Add `OpenApiMeta` to your `initTRPC` call:

```typescript
import { OpenApiMeta } from "trpc-openapi-2";

const t = initTRPC.meta<OpenApiMeta>().create();
```

#### Step 2: Use .meta() in your procedure

```typescript
const router = t.router({
  myProcedure: t.procedure
    .meta({ openapi: { ignore: true } }) /* 👈 */
    .input(...
});
```

## Comparison

[`trpc-openapi`](https://github.com/trpc/trpc-openapi)
and its new fork [`trpc-to-openapi`](https://github.com/mcampa/trpc-to-openapi)
are the two relevant libraries.

### They modify your API by adding new endpoints

**These other libraries do not simply generate an OpenAPI spec for your existing tRPC server.**
They add _new endpoints_ to your server and then generate an OpenAPI spec for those new endpoints.

For example:

```typescript
// trpc-openapi example:

export const appRouter = t.router({
  sayHello: t.procedure

    // trpc-openapi adds a new endpoint to your server (`/say-hello`)
    // and the generated OpenAPI spec only includes this new `/say-hello`
    // endpoint, not the original `/trpc/sayHello` procedure
    .meta({ /* 👉 */ openapi: { method: "GET", path: "/say-hello" } }),
});
```

In comparison, `trpc-openapi-2` simply generates an OpenAPI spec for your existing tRPC API,
without modifying your API functionality at all.

### They require you to use `.meta()` on every procedure

These libraries require that you add `.meta()` to every procedure that you
want included in your OpenAPI spec. In comparison, with `trpc-openapi-2` you can generate
the full OpenAPI spec by calling `trpcToOpenApi()` without modifying your procedures at all.
