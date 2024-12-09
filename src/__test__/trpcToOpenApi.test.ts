import { initTRPC } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { OpenApiMeta } from "../meta";
import { trpcToOpenApi } from "../trpcToOpenApi";

describe("trpcToOpenApi", () => {
  it("simple router", () => {
    const t = initTRPC.create();
    const router = t.router({
      createThing: t.procedure
        .input(z.object({ name: z.string() }))
        .mutation(() => undefined),
      getThing: t.procedure
        .input(z.object({ name: z.string() }))
        .query(() => undefined),
    });

    const openApiSpec = trpcToOpenApi({
      apiTitle: "My API",
      apiVersion: "1.0",
      router,
    });

    expect(openApiSpec).toEqual({
      openapi: "3.1.0",
      info: { title: "My API", version: "1.0" },
      paths: {
        "/createThing": {
          post: {
            operationId: "createThing",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { name: { type: "string" } },
                    required: ["name"],
                    additionalProperties: false,
                    $schema: "http://json-schema.org/draft-07/schema#",
                  },
                },
              },
            },
          },
        },
        "/getThing": {
          get: {
            operationId: "getThing",
            parameters: [
              {
                name: "input",
                in: "query",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: { name: { type: "string" } },
                      required: ["name"],
                      additionalProperties: false,
                      $schema: "http://json-schema.org/draft-07/schema#",
                    },
                  },
                },
              },
            ],
          },
        },
      },
    });
  });

  it("nested router", () => {
    const t = initTRPC.create();
    const router = t.mergeRouters(
      t.router({
        myRouter: t.router({
          createThing: t.procedure
            .input(z.object({ name: z.string() }))
            .mutation(() => undefined),
          getThing: t.procedure
            .input(z.object({ name: z.string() }))
            .query(() => undefined),
        }),
      })
    );

    const openApiSpec = trpcToOpenApi({
      apiTitle: "My API",
      apiVersion: "1.0",
      router,
    });

    expect(openApiSpec).toEqual({
      openapi: "3.1.0",
      info: { title: "My API", version: "1.0" },
      paths: {
        "/myRouter.createThing": {
          post: {
            operationId: "myRouter.createThing",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { name: { type: "string" } },
                    required: ["name"],
                    additionalProperties: false,
                    $schema: "http://json-schema.org/draft-07/schema#",
                  },
                },
              },
            },
          },
        },
        "/myRouter.getThing": {
          get: {
            operationId: "myRouter.getThing",
            parameters: [
              {
                name: "input",
                in: "query",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: { name: { type: "string" } },
                      required: ["name"],
                      additionalProperties: false,
                      $schema: "http://json-schema.org/draft-07/schema#",
                    },
                  },
                },
              },
            ],
          },
        },
      },
    });
  });

  it("basePath", () => {
    const t = initTRPC.create();
    const simpleRouter = t.router({
      createThing: t.procedure
        .input(z.object({ name: z.string() }))
        .mutation(() => undefined),
      getThing: t.procedure
        .input(z.object({ name: z.string() }))
        .query(() => undefined),
    });

    const openApiSpec = trpcToOpenApi({
      apiTitle: "My API",
      apiVersion: "1.0",
      router: simpleRouter,
      basePath: "/api",
    });

    expect(Object.keys(openApiSpec.paths ?? {})).toEqual([
      "/api/createThing",
      "/api/getThing",
    ]);
  });

  describe("OpenApiMeta", () => {
    it("ignore", () => {
      const t = initTRPC.meta<OpenApiMeta>().create();
      const simpleRouter = t.router({
        createThing: t.procedure
          .meta({ openapi: { ignore: true } })
          .input(z.object({ name: z.string() }))
          .mutation(() => undefined),
        getThing: t.procedure
          .meta({ openapi: { ignore: false } })
          .input(z.object({ name: z.string() }))
          .query(() => undefined),
        deleteThing: t.procedure
          .input(z.object({ name: z.string() }))
          .mutation(() => undefined),
      });

      const openApiSpec = trpcToOpenApi({
        apiTitle: "My API",
        apiVersion: "1.0",
        router: simpleRouter,
        basePath: "/api",
      });

      expect(Object.keys(openApiSpec.paths ?? {})).toEqual([
        "/api/getThing",
        "/api/deleteThing",
      ]);
    });
  });
});
