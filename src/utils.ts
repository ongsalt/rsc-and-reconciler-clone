import { KFNode, kfNodeSymbol } from "./jsx-runtime";

export type AnyFn = (...args: unknown[]) => unknown;

export function toArray<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input];
}

export function isKfNode(value: any): value is KFNode {
  return (typeof value === "object" && value?.$$kind === kfNodeSymbol);
}

export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
