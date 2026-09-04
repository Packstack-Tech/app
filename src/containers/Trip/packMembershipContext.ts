import { createContext, useContext } from 'react'

/**
 * item_id -> titles of the OTHER packs in this trip that hold it.
 *
 * Computed once at the list level (see usePackMembership) and provided here so
 * each NameCell can read its own row's membership without recomputing the whole
 * map per row. Empty on single-pack trips, so the badge renders nothing.
 */
export const PackMembershipContext = createContext<Map<number, string[]>>(
  new Map()
)

export const usePackMembershipContext = () => useContext(PackMembershipContext)
