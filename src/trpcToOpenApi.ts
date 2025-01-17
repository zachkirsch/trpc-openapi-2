import { type AnyTRPCRouter } from "@trpc/server";
import {
  type AnyProcedure,
  type ProcedureType,
  type RouterRecord,
} from "@trpc/server/unstable-core-do-not-import";
import { OpenAPIV3, type OpenAPIV3_1 } from "openapi-types";
import { type ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { OpenApiMeta } from "./meta.js";
import { ProcedureBuilderDef } from "./trpcTypes.js";
import { entries } from "./utils.js";

export function trpcToOpenApi({
  apiTitle,
  apiVersion,
  basePath,
  router,
  globalHeaders,
}: {
  apiTitle: string;
  apiVersion: string;
  basePath: string;
  router: AnyTRPCRouter;
  globalHeaders?: Record<string, OpenAPIV3_1.ParameterObject>;
}): OpenAPIV3_1.Document {
  const headerParameters =
    globalHeaders != null
      ? Object.keys(globalHeaders).map(
          (headerKey): OpenAPIV3_1.ReferenceObject => ({
            $ref: `#/components/parameters/${headerKey}`,
          }),
        )
      : undefined;

  return {
    openapi: "3.1.0",
    info: { title: apiTitle, version: apiVersion },
    paths: getPathsForRouterRecord({
      basePath,
      routerRecord: router._def.procedures as RouterRecord,
      additionalParameters: headerParameters,
    }),
    components: globalHeaders != null ? { parameters: globalHeaders } : {},
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

function getPathsForRouterRecord({
  basePath,
  routerRecord,
  additionalParameters,
}: {
  basePath: string;
  routerRecord: RouterRecord;
  additionalParameters:
    | (OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ParameterObject)[]
    | undefined;
}): OpenAPIV3_1.PathsObject {
  const paths: OpenAPIV3_1.PathsObject = {};

  for (const [procedureName, procedureOrRouterRecord] of entries(
    routerRecord,
  )) {
    Object.assign(
      paths,
      isProcedure(procedureOrRouterRecord)
        ? getPathsForProcedure({
            basePath,
            procedureName: String(procedureName),
            procedure: procedureOrRouterRecord,
            additionalParameters,
          })
        : getPathsForRouterRecord({
            basePath,
            routerRecord: procedureOrRouterRecord,
            additionalParameters,
          }),
    );
  }

  return paths;
}

function getPathsForProcedure({
  basePath,
  procedureName,
  procedure,
  additionalParameters,
}: {
  basePath: string;
  procedureName: string;
  procedure: AnyProcedure;
  additionalParameters:
    | (OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ParameterObject)[]
    | undefined;
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
          def.inputs[0] as ZodSchema,
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

    if (additionalParameters != null) {
      operation.parameters = [
        ...(operation.parameters ?? []),
        ...(additionalParameters ?? []),
      ];
    }
  }

  return {
    [`${basePath}/${procedureName}`]: {
      [method]: operation,
    },
  };
}

function isProcedure(
  maybeProcedure: AnyProcedure | RouterRecord,
): maybeProcedure is AnyProcedure {
  return (maybeProcedure as AnyProcedure)._def.procedure === true;
}
