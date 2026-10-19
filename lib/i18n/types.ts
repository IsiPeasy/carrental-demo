export type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

/** Theme dictionaries: `en` must have exactly the same shape as `it`. */
export function defineThemeDict<T extends object>(d: { it: T; en: Widen<T> }) {
  return d as { it: Widen<T>; en: Widen<T> };
}
