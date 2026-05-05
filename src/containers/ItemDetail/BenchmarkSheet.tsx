import { FC, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { ScrollArea } from '@/components/ui/ScrollArea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet'
import { useBenchmarks, useResetBenchmark, useUpdateBenchmark } from '@/queries/benchmark'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const BenchmarkRow: FC<{
  category: string
  lifespan: number | undefined
  hasOverride: boolean | undefined
}> = ({ category, lifespan, hasOverride }) => {
  const updateBenchmark = useUpdateBenchmark()
  const resetBenchmark = useResetBenchmark()
  const [value, setValue] = useState(String(lifespan ?? ''))

  const handleBlur = () => {
    const num = Number(value)
    if (!value || isNaN(num) || num === lifespan) return
    updateBenchmark.mutate({ categoryName: category, data: { lifespan_years: num } })
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="flex-1 text-sm">{category}</span>
      <div className="flex items-center gap-1">
        {hasOverride ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shrink-0"
            onClick={() => resetBenchmark.mutate(category)}
            title="Reset to default"
          >
            <RotateCcw size={12} />
          </Button>
        ) : (
          <span className="w-7 shrink-0" />
        )}
        <Input
          type="number"
          step="0.5"
          className="w-20 h-8 text-xs text-right"
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={handleBlur}
        />
        <span className="text-xs text-muted-foreground">yr</span>
      </div>
    </div>
  )
}

export const BenchmarkSheet: FC<Props> = ({ open, onOpenChange }) => {
  const { data: benchmarks } = useBenchmarks()

  const { defaultCategories, customCategories } = useMemo(() => {
    if (!benchmarks) return { defaultCategories: [], customCategories: [] }
    const defaults: string[] = []
    const custom: string[] = []
    for (const cat of Object.keys(benchmarks).sort()) {
      if (benchmarks[cat].is_default_fallback) {
        custom.push(cat)
      } else {
        defaults.push(cat)
      }
    }
    return { defaultCategories: defaults, customCategories: custom }
  }, [benchmarks])

  const hasAny = defaultCategories.length > 0 || customCategories.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Category Benchmarks</SheetTitle>
          <SheetDescription>
            Customize expected lifespan for each gear category. These are used to calculate replacement scores.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 min-h-0 px-4 pb-6">
          {defaultCategories.length > 0 && (
            <div className="divide-y divide-border">
              {defaultCategories.map(cat => (
                <BenchmarkRow
                  key={cat}
                  category={cat}
                  lifespan={benchmarks?.[cat]?.lifespan_years}
                  hasOverride={benchmarks?.[cat]?.has_override}
                />
              ))}
            </div>
          )}

          {customCategories.length > 0 && (
            <>
              <div className="mt-6 mb-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Custom Categories
                </h3>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  Using default estimates. Set a lifespan to customize.
                </p>
              </div>
              <div className="divide-y divide-border">
                {customCategories.map(cat => (
                  <BenchmarkRow
                    key={cat}
                    category={cat}
                    lifespan={benchmarks?.[cat]?.lifespan_years}
                    hasOverride={benchmarks?.[cat]?.has_override}
                  />
                ))}
              </div>
            </>
          )}

          {!hasAny && (
            <p className="text-sm text-muted-foreground py-4">
              No benchmarks available. Benchmarks will appear once gear categories are set up.
            </p>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
