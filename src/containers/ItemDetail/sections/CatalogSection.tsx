import { FC } from 'react'
import { ExternalLink } from 'lucide-react'

import { Item } from '@/types/item'

interface Props {
  item: Item
}

export const CatalogSection: FC<Props> = ({ item }) => {
  const cp = item.catalog_product
  if (!cp) return null

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Manufacturer Specs</h2>
      <div className="rounded-lg border border-border p-4 space-y-3">
        {cp.image_url && (
          <img
            src={cp.image_url}
            alt={cp.display_name}
            className="w-24 h-24 object-contain rounded-md bg-muted"
          />
        )}
        <div>
          <p className="text-sm font-medium">{cp.display_name}</p>
          {cp.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{cp.description}</p>
          )}
        </div>
        {cp.product_url && (
          <a
            href={cp.product_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink size={12} /> View product
          </a>
        )}
        {cp.additional_specs && Object.keys(cp.additional_specs).length > 0 && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {Object.entries(cp.additional_specs).map(([key, val]) => (
              <div key={key} className="contents">
                <dt className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</dt>
                <dd className="text-foreground">{String(val)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
