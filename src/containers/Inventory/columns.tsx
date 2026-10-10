import { Cell, ColumnDef } from '@tanstack/react-table'

import { numberSort, ordinalSort, orUndefined, stringSort } from '@/components/Tables/lib/sorting'
import { Currency, formatCurrency } from '@/lib/currencies'
import { ownedQuantity, ownedValue } from '@/lib/overpack'
import { convertWeight } from '@/lib/weight'
import { Item, Unit } from '@/types/item'

import {
  ConditionCell,
  EmptyDash,
  NameCell,
  NotesCell,
  WeightCell,
} from './cells'

const CONDITION_ORDER = ['new', 'good', 'fair', 'worn'] as const

export const columns = (currency: Currency): ColumnDef<Item>[] => [
  {
    id: 'name',
    header: 'Name',
    accessorFn: item => orUndefined(item.name),
    sortingFn: stringSort,
    sortUndefined: 'last',
    cell: ({ cell }) => <NameCell cell={cell} />,
    meta: {
      style: { width: '25%' },
    },
  },
  {
    id: 'brand',
    header: 'Manufacturer',
    accessorFn: item => orUndefined(item.brand?.name),
    sortingFn: stringSort,
    sortUndefined: 'last',
    cell: ({ getValue }) => getValue() || <EmptyDash />,
    meta: {
      style: { width: '15%' },
    },
  },
  {
    id: 'product',
    header: 'Product',
    accessorFn: ({ product, product_variant }) => {
      if (!product) return undefined
      if (!product_variant) return product.name
      return `${product.name} ${product_variant.name}`
    },
    sortingFn: stringSort,
    sortUndefined: 'last',
    cell: ({ getValue }) => getValue() || <EmptyDash />,
    meta: {
      style: { width: '20%' },
    },
  },
  {
    id: 'condition',
    header: 'Condition',
    accessorFn: item => orUndefined(item.condition),
    sortingFn: ordinalSort(CONDITION_ORDER),
    sortUndefined: 'last',
    cell: ({ cell }: { cell: Cell<Item, unknown> }) => <ConditionCell cell={cell} />,
    meta: {
      style: { width: '8%' },
    },
  },
  {
    id: 'quantity',
    header: 'Qty',
    accessorFn: item => ownedQuantity(item),
    sortingFn: numberSort,
    cell: ({ getValue }) => {
      const qty = getValue<number>()
      return qty > 1 ? qty : <span className="text-muted-foreground">1</span>
    },
    meta: {
      align: 'right',
      style: { textAlign: 'right', width: '5%' },
    },
  },
  {
    id: 'price',
    header: 'Value',
    // Owned quantity multiplies value: 3 × $20 stakes are $60 of gear.
    accessorFn: item => (item.price ? ownedValue(item) : undefined),
    sortingFn: numberSort,
    sortUndefined: 'last',
    cell: ({ getValue }) => {
      const value = getValue<number | undefined>()
      return value ? formatCurrency(value, currency) : <EmptyDash />
    },
    meta: {
      align: 'right',
      style: { textAlign: 'right', width: '10%' },
    },
  },
  {
    id: 'weight',
    header: 'Weight',
    // Sort on grams so mixed units compare correctly.
    accessorFn: item =>
      item.weight && item.unit ? convertWeight(item.weight, item.unit as Unit, 'g').weight : undefined,
    sortingFn: numberSort,
    sortUndefined: 'last',
    cell: ({ cell }) => <WeightCell cell={cell} />,
    meta: {
      align: 'right',
      style: { textAlign: 'right', width: '10%' },
    },
  },
  {
    id: 'calories',
    header: 'kcal',
    accessorFn: item => (item.consumable && item.calories ? item.calories : undefined),
    sortingFn: numberSort,
    sortUndefined: 'last',
    cell: ({ cell }) => {
      const item = cell.row.original
      if (!item.consumable || !item.calories) return <EmptyDash />
      return item.calories
    },
    meta: {
      align: 'right',
      style: { textAlign: 'right', width: '6%' },
    },
  },
  {
    id: 'notes',
    header: 'Notes',
    accessorKey: 'notes',
    enableSorting: false,
    cell: ({ cell }) => <NotesCell cell={cell} />,
    meta: {
      align: 'center',
      style: { textAlign: 'center', width: '6%' },
    },
  },
]
