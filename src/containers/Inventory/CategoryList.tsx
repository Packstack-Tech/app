import { FC } from 'react'

import { useCategorizedItems } from '@/hooks/useCategorizedItems'

export const CategoryList: FC = () => {
  const categories = useCategorizedItems({})

  const scrollToCategory = (categoryName: string) => {
    const element = document.getElementById(`category-${categoryName}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="w-48 shrink-0">
      <div className="sticky top-4">
        <h3 className="font-bold text-primary text-xs md:text-sm mb-2">
          Categories
        </h3>
        <div className="space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {categories.map(({ category }) => {
            const categoryName = category?.category?.name || 'Uncategorized'
            return (
              <button
                key={categoryName}
                onClick={() => scrollToCategory(categoryName)}
                className="w-full text-left px-2 py-1 text-xs md:text-sm rounded-sm hover:bg-muted dark:hover:bg-slate-900 transition-colors"
              >
                {categoryName}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
