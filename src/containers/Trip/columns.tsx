import { ColumnDef } from '@tanstack/react-table'

import { Currency } from '@/lib/currencies'
import { PackItem } from '@/types/pack'

import {
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
    meta: {
      style: {
        width: '20%',
      },
    },
  },
  {
    header: 'Product',
    accessorFn: ({ item: { brand, product, product_variant } }) => {
      if (!brand) return null
      if (!product) return brand.name
      if (!product_variant) return `${brand.name} ${product.name}`
      return `${brand.name} ${product.name} ${product_variant.name}`
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
        width: '15%',
      },
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
