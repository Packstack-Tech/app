import { saveAs } from 'file-saver'

import { groupByCategory } from '@/lib/categorize'
import { Currency } from '@/lib/currencies'
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
        category,
        weight,
        unit,
        consumable,
        price,
        product_url,
        notes,
      }) =>
        [
          name,
          brand?.name || '',
          product?.name || '',
          category?.category.name || '',
          weight,
          unit,
          price || 0,
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
  const { brand, product, product_variant } = item
  if (!brand) return ''
  if (!product) return brand.name
  if (!product_variant) return `${brand.name} ${product.name}`
  return `${brand.name} ${product.name} ${product_variant.name}`
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
      const { item, quantity, worn, checked } = packItem
      const kcal = item.calories ? item.calories * quantity : ''
      const value = item.price
        ? `${currency.symbol}${item.price.toFixed(currency.decimal_digits)}`
        : ''
      return [
        categoryName,
        item.name,
        formatProduct(item),
        quantity,
        worn ? 'true' : 'false',
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
