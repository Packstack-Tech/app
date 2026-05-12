import { Cell, ColumnDef } from '@tanstack/react-table'

import { Currency, formatCurrency } from '@/lib/currencies'
import { Item } from '@/types/item'
import { ItemScores } from '@/hooks/useReplacementScores'

import {
  ConditionCell,
  EmptyDash,
  NameCell,
  NotesCell,
  WeightCell,
} from './cells'

export const columns = (
  currency: Currency,
  scores: ItemScores,
): ColumnDef<Item>[] => [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ cell }) => <NameCell cell={cell} />,
    meta: {
      style: { width: '25%' },
    },
  },
  {
    header: 'Manufacturer',
    accessorKey: 'brand.name',
    cell: ({ getValue }) => getValue() || <EmptyDash />,
    meta: {
      style: { width: '15%' },
    },
  },
  {
    header: 'Product',
    accessorFn: ({ product, product_variant }) => {
      if (!product) return null
      if (!product_variant) return product.name
      return `${product.name} ${product_variant.name}`
    },
    cell: ({ getValue }) => getValue() || <EmptyDash />,
    meta: {
      style: { width: '20%' },
    },
  },
  {
    header: 'Condition',
    accessorKey: 'condition',
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
    header: 'Value',
    accessorFn: item => {
      if (!item.price) return null
      return formatCurrency(item.price, currency)
    },
    cell: ({ getValue }) => getValue() || <EmptyDash />,
    meta: {
      align: 'right',
      style: { textAlign: 'right', width: '10%' },
    },
  },
  {
    header: 'Weight',
    cell: ({ cell }) => <WeightCell cell={cell} />,
    meta: {
      align: 'right',
      style: { textAlign: 'right', width: '10%' },
    },
  },
  {
    header: 'kcal',
    accessorKey: 'calories',
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
    header: 'Notes',
    accessorKey: 'notes',
    cell: ({ cell }) => <NotesCell cell={cell} />,
    meta: {
      align: 'center',
      style: { textAlign: 'center', width: '6%' },
    },
  },
]
