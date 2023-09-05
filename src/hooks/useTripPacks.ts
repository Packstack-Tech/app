import { create } from "zustand"
import { PackItem, PackItemEditableKeys, TripPackKeys } from "@/types/pack"
import { TripPack } from "@/types/pack"

interface TripPacksState {
  selectedIndex: number
  packs: TripPack[]
  checklistMode: boolean
  synced: boolean
  addPack: () => void
  removePack: (index: number) => void
  updatePack: (index: number, key: TripPackKeys, value: string) => void
  selectPack: (index: number) => void
  setPacks: (packs: TripPack[]) => void

  updateItem: (
    id: number,
    key: PackItemEditableKeys,
    value: number | boolean
  ) => void
  setItems: (items: PackItem[]) => void
  addItem: (item: PackItem) => void
  removeItem: (id: number) => void
  setCategoryItems: (items: PackItem[]) => void
  toggleChecklistMode: () => void
}

export const initPack = {
  title: "New pack",
  items: [],
}

export const useTripPacks = create<TripPacksState>((set) => ({
  selectedIndex: 0,
  checklistMode: false,
  synced: true,
  // initialize with an empty pack
  packs: [initPack],
  addPack: () =>
    set((state) => {
      const count = state.packs.length
      const packs = [...state.packs, { title: `Pack ${count + 1}`, items: [] }]
      return { ...state, selectedIndex: count, packs, synced: false }
    }),
  removePack: (index) =>
    set((state) => {
      // Prevent user from deleting the only pack
      if (state.packs.length === 1) return { ...state }

      const packs = state.packs.filter((_, i) => i !== index)
      const selectedIndex =
        index === state.selectedIndex ? 0 : state.selectedIndex
      return { ...state, selectedIndex, packs, synced: false }
    }),
  updatePack: (index, key, value) =>
    set((state) => {
      const pack = state.packs[index]
      if (!pack) return { ...state }
      const modifiedPack = { ...pack, [key]: value }
      const packs = [...state.packs]
      packs[index] = modifiedPack
      return { ...state, packs, synced: false }
    }),
  selectPack: (index) => set((state) => ({ ...state, selectedIndex: index })),
  setPacks: (packs) =>
    set((state) => {
      packs.sort((a, b) => a.title.localeCompare(b.title))
      return { ...state, packs, synced: true }
    }),

  addItem: (item) =>
    set((state) => {
      const pack = state.packs[state.selectedIndex]
      const modifiedPack = { ...pack, items: [...pack.items, item] }
      const packs = [...state.packs]
      packs[state.selectedIndex] = modifiedPack
      return { ...state, packs, synced: false }
    }),
  removeItem: (id) =>
    set((state) => {
      const pack = state.packs[state.selectedIndex]
      const modifiedPack = {
        ...pack,
        items: pack.items.filter((item) => item.item_id !== id),
      }
      const packs = [...state.packs]
      packs[state.selectedIndex] = modifiedPack
      return { ...state, packs, synced: false }
    }),
  updateItem: (
    id: number,
    key: PackItemEditableKeys,
    value: number | boolean
  ) =>
    set((state) => {
      const pack = state.packs[state.selectedIndex]
      const modifiedItems = pack.items.map((item) => {
        if (item.item_id === id) {
          return { ...item, [key]: value }
        }
        return item
      })
      const modifiedPack = { ...pack, items: modifiedItems }
      const packs = [...state.packs]
      packs[state.selectedIndex] = modifiedPack
      return { ...state, packs, synced: false }
    }),
  setItems: (items) =>
    set((state) => {
      const pack = state.packs[state.selectedIndex]
      const modifiedPack = { ...pack, items }
      const packs = [...state.packs]
      packs[state.selectedIndex] = modifiedPack
      return { ...state, packs, synced: false }
    }),

  setCategoryItems: (updatedItems) =>
    set((state) => {
      const pack = state.packs[state.selectedIndex]
      const categoryId = updatedItems[0].item.category_id
      const packItems = pack.items.filter(
        (item) => item.item.category_id !== categoryId
      )
      packItems.push(...updatedItems)
      const packs = [...state.packs]
      packs[state.selectedIndex] = { ...pack, items: packItems }
      return { ...state, packs, synced: false }
    }),
  toggleChecklistMode: () =>
    set((state) => ({ ...state, checklistMode: !state.checklistMode })),
}))
