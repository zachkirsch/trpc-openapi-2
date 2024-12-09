import { type AnyTRPCRouter } from "@trpc/server";
import {
  type AnyProcedure,
  type ProcedureType,
  type RouterRecord,
} from "@trpc/server/unstable-core-do-not-import";
import { type OpenAPIV3, type OpenAPIV3_1 } from "openapi-types";
import { type ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { OpenApiMeta } from "./meta";
import { ProcedureBuilderDef } from "./trpcTypes";
import { entries } from "./utils";

export function trpcToOpenApi({
  apiTitle,
  apiVersion,
  basePath = "",
  router,
}: {
  apiTitle: string;
  apiVersion: string;
  basePath?: string;
  router: AnyTRPCRouter;
}): OpenAPIV3_1.Document {
  return {
    openapi: "3.1.0",
    info: { title: apiTitle, version: apiVersion },
    paths: getPathsForRouterRecord(
      basePath,
      router._def.procedures as RouterRecord
    ),
  };
}

const PROCEDURE_TYPE_HTTP_METHOD_MAP: Record<
  ProcedureType,
  string | undefined
> = {
  query: "get",
  mutation: "post",
  subscription: undefined,
};

function getPathsForRouterRecord(
  basePath: string,
  routerRecord: RouterRecord
): OpenAPIV3_1.PathsObject {
  const paths: OpenAPIV3_1.PathsObject = {};

  for (const [procedureName, procedureOrRouterRecord] of entries(
    routerRecord
  )) {
    Object.assign(
      paths,
      isProcedure(procedureOrRouterRecord)
        ? getPathsForProcedure({
            basePath,
            procedureName: String(procedureName),
            procedure: procedureOrRouterRecord,
          })
        : getPathsForRouterRecord(basePath, procedureOrRouterRecord)
    );
  }

  return paths;
}

function getPathsForProcedure({
  basePath,
  procedureName,
  procedure,
}: {
  basePath: string;
  procedureName: string;
  procedure: AnyProcedure;
}): OpenAPIV3_1.PathsObject {
  const def = procedure._def as unknown as AnyProcedure["_def"] &
    ProcedureBuilderDef;

  const meta = def.meta as OpenApiMeta | undefined;
  if (meta?.openapi.ignore === true) {
    return {};
  }

  const method = PROCEDURE_TYPE_HTTP_METHOD_MAP[def.type];
  if (method == null) {
    return {};
  }

  const operation: OpenAPIV3_1.OperationObject = {
    operationId: procedureName,
  };

  if (def.inputs[0] != null) {
    const content = {
      "application/json": {
        schema: zodToJsonSchema(
          def.inputs[0] as ZodSchema
        ) as OpenAPIV3.SchemaObject,
      },
    };

    if (method === "get") {
      operation.parameters = [{ name: "input", in: "query", content }];
    } else {
      operation.requestBody = {
        required: true,
        content,
      };
    }
  }

  return {
    [`${basePath}/${procedureName}`]: {
      [method]: operation,
    },
  };
}

function isProcedure(
  maybeProcedure: AnyProcedure | RouterRecord
): maybeProcedure is AnyProcedure {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare, @typescript-eslint/no-unnecessary-condition
  return (maybeProcedure as AnyProcedure)._def.procedure === true;
}
