import { Cell, ColumnDef } from '@tanstack/react-table'

import { numberSort, ordinalSort, orUndefined, stringSort } from '@/components/Tables/lib/sorting'
import { ItemScores } from '@/hooks/useReplacementScores'
import { Currency, formatCurrency } from '@/lib/currencies'
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

export const columns = (
  currency: Currency,
  scores: ItemScores,
): ColumnDef<Item>[] => [
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
    cell: ({ cell }: { cell: Cell<Item, unknown> }) => (
      <ConditionCell
        cell={cell}
        score={scores.get(cell.row.original.id)}
      />
    ),
    meta: {
      style: { width: '8%' },
    },
  },
  {
    id: 'price',
    header: 'Value',
    accessorFn: item => (item.price ? item.price : undefined),
    sortingFn: numberSort,
    sortUndefined: 'last',
    cell: ({ getValue }) => {
      const price = getValue<number | undefined>()
      return price ? formatCurrency(price, currency) : <EmptyDash />
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
