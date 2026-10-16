import { ColumnDef } from '@tanstack/react-table'

import { Currency, formatCurrency } from '@/lib/currencies'
import { productName, variantName } from '@/lib/productName'
import { PackItem } from '@/types/pack'

import {
  NameCell,
  NotesCell,
  QuantityCell,
  RemoveItemCell,
  WeightCell,
  WornCell,
} from './cells'

export const columns = (currency: Currency): ColumnDef<PackItem>[] => [
  {
    header: 'Quantity',
    cell: ({ cell }) => <QuantityCell cell={cell} />,
    meta: {
      style: { width: '10%' },
    },
  },
  {
    header: 'Name',
    accessorKey: 'item.name',
    cell: ({ cell }) => <NameCell cell={cell} />,
    meta: {
      style: {
        width: '20%',
      },
    },
  },
  {
    header: 'Product',
    accessorFn: ({ item }) => {
      if (!item.brand) return null
      return [item.brand.name, productName(item), variantName(item)]
        .filter(Boolean)
        .join(' ')
    },
    meta: {
      style: {
        width: '20%',
      },
    },
  },
  {
    header: 'Value',
    accessorFn: ({ item }) => {
      if (!item.price) return null
      return formatCurrency(item.price, currency)
    },
    meta: {
      style: {
        width: '15%',
      },
    },
  },
  {
    header: 'Notes',
    accessorKey: 'notes',
    cell: ({ cell }) => <NotesCell cell={cell} />,
    meta: {
      align: 'center',
      style: {
        textAlign: 'center',
        width: '10%',
      },
    },
  },
  {
    id: 'kcal',
    header: 'kcal',
    accessorFn: ({ item, quantity }) => {
      if (!item.calories) return null
      return item.calories * quantity
    },
    meta: {
      align: 'right',
      style: { textAlign: 'right', width: '7%' },
    },
  },
  {
    header: 'Worn',
    cell: ({ cell }) => <WornCell cell={cell} />,
    meta: {
      align: 'center',
      style: { textAlign: 'center', width: '5%' },
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
    id: 'remove',
    cell: ({ cell }) => <RemoveItemCell cell={cell} />,
    meta: {
      align: 'center',
      style: { textAlign: 'center', width: '5%' },
    },
  },
]
