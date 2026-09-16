import { create } from 'zustand'

import { SYSTEM_UNIT } from '@/lib/consts'
import { Item } from '@/types/item'
import { PackItem, PackItemEditableKeys, TripPackKeys } from '@/types/pack'
import { TripPack } from '@/types/pack'

export type PackViewMode = 'pack' | 'all'

interface TripPacksState {
  selectedIndex: number
  packs: TripPack[]
  /**
   * 'all' is the cross-pack overview, only reachable when packs.length > 1.
   * Every writer that can drop the trip below two packs must leave 'all', or
   * the view would render against a pack set that can no longer express it.
   */
  viewMode: PackViewMode
  /**
   * Which trip `packs` currently belongs to. This store is a module
   * singleton, so a screen can hold one trip's packs while a component still
   * mounted for another trip reads them; consumers must check this before
   * acting on `packs`.
   */
  loadedTripId: number | null
  /**
   * Bumped by every user edit. The save is asynchronous, so edits can arrive
   * while one is in flight; comparing revisions is how the completion handler
   * tells whether what it sent is still what we hold. assignPackId
   * deliberately does NOT bump it — a server id is not an edit.
   */
  revision: number
  checklistMode: boolean
  displayUnitSystem: SYSTEM_UNIT | null
  synced: boolean
  isDragging: boolean
  addPack: (title: string) => void
  removePack: (index: number) => void
  updatePack: (index: number, key: TripPackKeys, value: string | number | null) => void
  selectPack: (index: number) => void
  setViewMode: (mode: PackViewMode) => void
  setPacks: (packs: TripPack[], tripId: number) => void
  setDragging: (dragging: boolean) => void
  /**
   * Returns false when the save this completes no longer describes what we
   * hold — a different trip has loaded, or edits landed while it was in
   * flight. The caller must not treat those as saved.
   */
  markSynced: (tripId: number, revision: number) => boolean
  assignPackId: (index: number, id: number, tripId: number) => void

  updateItem: (
    id: number,
    key: PackItemEditableKeys,
    value: number | boolean
  ) => void
  setItems: (items: PackItem[]) => void
  addItem: (item: PackItem) => void
  removeItem: (id: number) => void
  /**
   * Removes an item from a specific pack by index rather than the selected
   * one. The All overview needs this: the same item can sit in several packs,
   * so a removal there has to name which.
   */
  removeItemFromPack: (index: number, id: number) => void
  setCategoryItems: (items: PackItem[]) => void
  updateBaseItem: (itemId: number, updatedFields: Partial<Item>) => void
  showCalories: boolean
  toggleChecklistMode: () => void
  toggleShowCalories: () => void
  setDisplayUnitSystem: (system: SYSTEM_UNIT) => void
}

export const initPack = {
  title: 'New pack',
  items: [],
}

/**
 * Replaces the pack at `index` in the packs array.
 * Returns a new array (does not mutate).
 */
function replacePack(packs: TripPack[], index: number, pack: TripPack) {
  const next = [...packs]
  next[index] = pack
  return next
}

/**
 * Returns a state update that modifies the currently selected pack's items
 * and marks the store as unsynced.
 */
function updateCurrentPackItems(
  state: TripPacksState,
  updater: (items: PackItem[]) => PackItem[]
) {
  const pack = state.packs[state.selectedIndex]
  if (!pack) return {}
  return {
    packs: replacePack(state.packs, state.selectedIndex, {
      ...pack,
      items: updater(pack.items),
    }),
    synced: false,
    revision: state.revision + 1,
  }
}

export const useTripPacks = create<TripPacksState>((set, get) => ({
  selectedIndex: 0,
  viewMode: 'pack',
  loadedTripId: null,
  revision: 0,
  checklistMode: false,
  showCalories: true,
  displayUnitSystem: null,
  synced: true,
  isDragging: false,
  packs: [initPack],

  addPack: title =>
    set(state => {
      const count = state.packs.length
      return {
        selectedIndex: count,
        packs: [...state.packs, { title, items: [] }],
        synced: false,
        revision: state.revision + 1,
      }
    }),

  removePack: index =>
    set(state => {
      if (state.packs.length === 1) return state
      const packs = state.packs.filter((_, i) => i !== index)
      let selectedIndex = state.selectedIndex
      if (index === selectedIndex) {
        selectedIndex = 0
      } else if (index < selectedIndex) {
        selectedIndex = selectedIndex - 1
      }
      // An in-flight save described the old array; bumping invalidates it so
      // its completion cannot mark this delete as saved.
      return {
        selectedIndex,
        packs,
        // The All pill disappears at one pack, so the view must not stay on it.
        viewMode: packs.length > 1 ? state.viewMode : 'pack',
        revision: state.revision + 1,
      }
    }),

  updatePack: (index, key, value) =>
    set(state => {
      const pack = state.packs[index]
      if (!pack) return state
      return {
        packs: replacePack(state.packs, index, { ...pack, [key]: value }),
        synced: false,
        revision: state.revision + 1,
      }
    }),

  selectPack: index => set({ selectedIndex: index, viewMode: 'pack' }),

  setViewMode: mode => set({ viewMode: mode }),

  setDragging: dragging =>
    set(state => ({
      isDragging: dragging,
      ...(!dragging && { synced: false, revision: state.revision + 1 }),
    })),

  setPacks: (packs, tripId) =>
    set({
      packs: [...packs].sort((a, b) => (a.id ?? Infinity) - (b.id ?? Infinity)),
      synced: true,
      loadedTripId: tripId,
      revision: 0,
      // Loading a trip with fewer packs than the last one must not leave the
      // index pointing past the end — packs[selectedIndex] would be undefined
      // and every selected-pack action would silently no-op.
      selectedIndex: 0,
      viewMode: 'pack',
    }),

  markSynced: (tripId, revision) => {
    const state = get()
    // A save started on one trip can resolve after another has loaded.
    if (state.loadedTripId !== tripId) return false
    // Edits made during the save are not covered by it. Marking them synced
    // here would strand them: nothing would ever retry them.
    if (state.revision !== revision) return false
    set({ synced: true })
    return true
  },

  assignPackId: (index, id, tripId) =>
    set(state => {
      // A create resolving after the user opened another trip would otherwise
      // stamp this id onto whichever pack now sits at that position.
      if (state.loadedTripId !== tripId) return state
      const pack = state.packs[index]
      if (!pack) return state
      // Positional addressing survives here only because the slot is checked
      // to still be the id-less pack we created. A delete landing mid-flight
      // shifts the array, and without this the id would be stamped onto a
      // pack that already has one — orphaning this one server-side.
      if (pack.id) return state
      return { packs: replacePack(state.packs, index, { ...pack, id }) }
    }),

  addItem: item =>
    set(state => updateCurrentPackItems(state, items => [...items, item])),

  removeItem: id =>
    set(state =>
      updateCurrentPackItems(state, items =>
        items.filter(item => item.item_id !== id)
      )
    ),

  removeItemFromPack: (index, id) =>
    set(state => {
      const pack = state.packs[index]
      if (!pack) return state
      return {
        packs: replacePack(state.packs, index, {
          ...pack,
          items: pack.items.filter(item => item.item_id !== id),
        }),
        synced: false,
        revision: state.revision + 1,
      }
    }),

  updateItem: (id, key, value) =>
    set(state =>
      updateCurrentPackItems(state, items =>
        items.map(item => (item.item_id === id ? { ...item, [key]: value } : item))
      )
    ),

  setItems: items => set(state => updateCurrentPackItems(state, () => items)),

  setCategoryItems: updatedItems =>
    set(state => {
      const categoryId = updatedItems[0].item.category_id
      const pack = state.packs[state.selectedIndex]
      if (!pack) return {}
      const updatedPack = {
        ...pack,
        items: [
          ...pack.items.filter(item => item.item.category_id !== categoryId),
          ...updatedItems,
        ],
      }
      return {
        packs: replacePack(state.packs, state.selectedIndex, updatedPack),
        synced: state.isDragging ? state.synced : false,
        // Bumped even mid-drag: the array changed, so an in-flight save no
        // longer describes what we hold regardless of the synced flag.
        revision: state.revision + 1,
      }
    }),

  updateBaseItem: (itemId, updatedFields) =>
    set(state => ({
      packs: state.packs.map(pack => ({
        ...pack,
        items: pack.items.map(pi =>
          pi.item.id === itemId
            ? { ...pi, item: { ...pi.item, ...updatedFields } }
            : pi
        ),
      })),
    })),

  toggleChecklistMode: () =>
    set(state => ({ checklistMode: !state.checklistMode })),

  toggleShowCalories: () =>
    set(state => ({ showCalories: !state.showCalories })),

  setDisplayUnitSystem: system => set({ displayUnitSystem: system }),
}))
