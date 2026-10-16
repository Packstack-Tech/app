import { saveAs } from 'file-saver'

import { groupByCategory } from '@/lib/categorize'
import { Currency, formatCurrency } from '@/lib/currencies'
import { productName, variantName } from '@/lib/productName'
import { wornQuantity } from '@/lib/worn'
import { Item } from '@/types/item'
import { PackItem } from '@/types/pack'

const csvEscape = (value: string | number | null | undefined): string => {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export const downloadInventory = (items?: Item[]) => {
  if (!items) return

  const header = [
    'name',
    'manufacturer',
    'product',
    'category',
    'weight',
    'unit',
    'price',
    'quantity',
    'consumable',
    'product_url',
    'notes',
  ].join(',')
  const csv = items
    .map(
      ({
        name,
        brand,
        product,
        catalog_product,
        category,
        weight,
        unit,
        consumable,
        price,
        quantity,
        product_url,
        notes,
      }) =>
        [
          name,
          brand?.name || '',
          productName({ product, catalog_product }) || '',
          category?.category.name || '',
          weight,
          unit,
          price || 0,
          quantity ?? 1,
          consumable ? 'true' : '',
          product_url,
          notes,
        ]
          .map(csvEscape)
          .join(',')
    )
    .join('\n')

  const content = header + '\n' + csv

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, 'inventory.csv')
}

function formatProduct(item: Item): string {
  if (!item.brand) return ''
  return [item.brand.name, productName(item), variantName(item)]
    .filter(Boolean)
    .join(' ')
}

type PackingListOptions = {
  currency: Currency
  title: string
}

export const downloadPackingListCsv = (
  packItems: PackItem[],
  { currency, title }: PackingListOptions
) => {
  const header = [
    'category',
    'name',
    'product',
    'quantity',
    'worn',
    'checked',
    'weight',
    'unit',
    'kcal',
    'value',
    'consumable',
    'product_url',
    'notes',
  ].join(',')

  const categorized = groupByCategory<PackItem>(
    packItems,
    item => item.item.category_id?.toString() || 'uncategorized',
    item => item.item.category,
    item => item.sort_order || 0
  )

  const rows = categorized.flatMap(({ category, items }) => {
    const categoryName = category?.category?.name ?? 'Uncategorized'
    return items.map(packItem => {
      const { item, quantity, checked } = packItem
      const kcal = item.calories ? item.calories * quantity : ''
      const value = item.price ? formatCurrency(item.price, currency) : ''
      return [
        categoryName,
        item.name,
        formatProduct(item),
        quantity,
        // Number of units worn (0..quantity). Column name kept as `worn`.
        wornQuantity(packItem),
        checked ? 'true' : 'false',
        item.weight ?? '',
        item.unit,
        kcal,
        value,
        item.consumable ? 'true' : 'false',
        item.product_url,
        item.notes,
      ]
        .map(csvEscape)
        .join(',')
    })
  })

  const content = header + (rows.length ? '\n' + rows.join('\n') : '')
  const slug = title
    ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : ''
  const filename = slug ? `packing-list-${slug}.csv` : 'packing-list.csv'
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, filename)
}

export const downloadTemplate = () => {
  const header = [
    'name',
    'manufacturer',
    'product',
    'category',
    'weight',
    'unit',
    'price',
    'consumable',
    'product_url',
    'notes',
  ].join(',')
  const content = header

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, 'inventory-template.csv')
}
