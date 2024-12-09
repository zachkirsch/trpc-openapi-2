// types from trpc that are not exported

import { AnyTRPCMiddlewareFunction } from "@trpc/server";
import { Parser } from "@trpc/server/unstable-core-do-not-import";

export type ProcedureBuilderDef = {
  procedure: true;
  inputs: Parser[];
  output?: Parser;
  meta?: unknown;
  middlewares: AnyTRPCMiddlewareFunction[];
  mutation?: boolean;
  query?: boolean;
  subscription?: boolean;
};
