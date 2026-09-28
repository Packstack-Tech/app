import { Row } from '@tanstack/react-table'

/**
 * Sorting helpers for the closet / pack tables.
 *
 * Convention: accessors return `undefined` for an empty cell and the column
 * sets `sortUndefined: 'last'`, so empties sink to the bottom in both
 * directions. The comparators below only ever see real values.
 */

/** Normalize an empty-ish value to undefined so sortUndefined applies. */
export const orUndefined = <T>(v: T | null | undefined | ''): T | undefined =>
  v == null || v === '' || (typeof v === 'number' && Number.isNaN(v)) ? undefined : (v as T)

/** Case-insensitive, numeric-aware string compare. */
export const stringSort = <T,>(a: Row<T>, b: Row<T>, columnId: string) =>
  String(a.getValue(columnId)).localeCompare(String(b.getValue(columnId)), undefined, {
    sensitivity: 'base',
    numeric: true,
  })

export const numberSort = <T,>(a: Row<T>, b: Row<T>, columnId: string) =>
  (a.getValue<number>(columnId) ?? 0) - (b.getValue<number>(columnId) ?? 0)

/** Ordinal over a fixed list (e.g. condition new → good → fair → worn). */
export const ordinalSort =
  (order: readonly string[]) =>
  <T,>(a: Row<T>, b: Row<T>, columnId: string) =>
    order.indexOf(a.getValue<string>(columnId)) - order.indexOf(b.getValue<string>(columnId))
