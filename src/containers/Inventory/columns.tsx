import { ColumnDef } from '@tanstack/react-table'

import { Currency } from '@/lib/currencies'
import { Item } from '@/types/item'

import { Action, NotesCell, WeightCell } from './cells'

export const columns = (currency: Currency): ColumnDef<Item>[] => [
  {
    header: 'Name',
    accessorKey: 'name',
    meta: {
      style: {
        width: '20%',
      },
    },
  },
  {
    header: 'Manufacturer',
    accessorKey: 'brand.name',
    meta: {
      style: {
        width: '20%',
      },
    },
  },
  {
    header: 'Product',
    accessorFn: ({ product, product_variant }) => {
      if (!product) return null
      if (!product_variant) return product.name
      return `${product.name} ${product_variant.name}`
    },
    meta: {
      style: {
        width: '20%',
      },
    },
  },
  {
    header: 'Value',
    accessorFn: item => {
      if (!item.price) return null
      return `${currency.symbol}${item.price.toFixed(currency.decimal_digits)}`
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
        width: '5%',
      },
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
    id: 'actions',
    cell: ({ cell }) => <Action cell={cell} />,
    meta: {
      align: 'right',
      style: {
        width: '10%',
      },
    },
  },
]
