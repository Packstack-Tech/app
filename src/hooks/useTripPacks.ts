import { create } from 'zustand'

import { Item } from '@/types/item'
import { PackItem, PackItemEditableKeys, TripPackKeys } from '@/types/pack'
import { TripPack } from '@/types/pack'

interface TripPacksState {
  selectedIndex: number
  packs: TripPack[]
  checklistMode: boolean
  synced: boolean
  isDragging: boolean
  addPack: () => void
  removePack: (index: number) => void
  updatePack: (index: number, key: TripPackKeys, value: string) => void
  selectPack: (index: number) => void
  setPacks: (packs: TripPack[]) => void
  setDragging: (dragging: boolean) => void
  markSynced: () => void
  assignPackId: (index: number, id: number) => void

  updateItem: (
    id: number,
    key: PackItemEditableKeys,
    value: number | boolean
  ) => void
  setItems: (items: PackItem[]) => void
  addItem: (item: PackItem) => void
  removeItem: (id: number) => void
  setCategoryItems: (items: PackItem[]) => void
  updateBaseItem: (itemId: number, updatedFields: Partial<Item>) => void
  toggleChecklistMode: () => void
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
  }
}

export const useTripPacks = create<TripPacksState>(set => ({
  selectedIndex: 0,
  checklistMode: false,
  synced: true,
  isDragging: false,
  packs: [initPack],

  addPack: () =>
    set(state => {
      const count = state.packs.length
      return {
        selectedIndex: count,
        packs: [...state.packs, { title: `Pack ${count + 1}`, items: [] }],
        synced: false,
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
      return { selectedIndex, packs }
    }),

  updatePack: (index, key, value) =>
    set(state => {
      const pack = state.packs[index]
      if (!pack) return state
      return {
        packs: replacePack(state.packs, index, { ...pack, [key]: value }),
        synced: false,
      }
    }),

  selectPack: index => set({ selectedIndex: index }),

  setDragging: dragging =>
    set({ isDragging: dragging, ...(!dragging && { synced: false }) }),

  setPacks: packs =>
    set({
      packs: [...packs].sort((a, b) => (a.id ?? Infinity) - (b.id ?? Infinity)),
      synced: true,
    }),

  markSynced: () => set({ synced: true }),

  assignPackId: (index, id) =>
    set(state => {
      const pack = state.packs[index]
      if (!pack) return state
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
}))
