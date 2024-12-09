export type Entry<T> = [keyof T, Value<T>];
export type Value<T> = T[keyof T];

export function entries<T extends object>(object: T): Entry<T>[] {
  return Object.entries(object) as Entry<T>[];
}
