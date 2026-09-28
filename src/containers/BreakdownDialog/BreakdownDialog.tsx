import { FC, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, PieChart } from 'lucide-react'
import { ResponsivePie } from '@nivo/pie'

import { Button } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { useDarkMode } from '@/hooks/useDarkMode'
import { Mixpanel } from '@/lib/mixpanel'
import { CategoryWeight } from '@/types/category'

interface Props {
  data: CategoryWeight[]
  label?: string
}

export const BreakdownDialog: FC<Props> = ({ data, label = 'View Breakdown' }) => {
  const { isDark } = useDarkMode()
  const chartColors = [
    '#3366CC',
    '#DC3912',
    '#FF9900',
    '#109618',
    '#990099',
    '#0099C6',
    '#DD4477',
    '#66AA00',
    '#B82E2E',
    '#316395',
    '#994499',
    '#22AA99',
    '#AAAA11',
    '#6633CC',
    '#E67300',
    '#8B0707',
    '#651067',
    '#329262',
    '#5574A6',
    '#3B3EAC',
  ]
  // Colors are assigned by pie order and must follow the category when the
  // table is sorted, so each row carries its own color.
  const chartData = data.map(({ label, value }, index) => {
    return {
      id: label,
      label: label,
      value: value,
      color: chartColors[index % chartColors.length],
    }
  })

  type SortKey = 'label' | 'value'
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean } | null>(null)
  const toggleSort = (key: SortKey) =>
    setSort(prev => {
      // asc → desc → off (weight starts descending: heaviest first is the useful view)
      const next =
        !prev || prev.key !== key
          ? { key, desc: key === 'value' }
          : prev.desc === (key === 'value')
            ? { key, desc: key !== 'value' }
            : null
      Mixpanel.track('Breakdown:Sort', next ? { column: next.key, direction: next.desc ? 'desc' : 'asc' } : { column: null })
      return next
    })
  const tableRows = useMemo(() => {
    if (!sort) return chartData
    const rows = [...chartData]
    rows.sort((a, b) =>
      sort.key === 'value'
        ? a.value - b.value
        : a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
    )
    return sort.desc ? rows.reverse() : rows
  }, [chartData, sort])
  const SortIcon = ({ column }: { column: SortKey }) =>
    sort?.key === column
      ? sort.desc ? <ArrowDown size={12} /> : <ArrowUp size={12} />
      : <ArrowUpDown size={12} className="opacity-30" />

  const aggregateUnit = data[0]?.unit || ''
  const valueFormat = (value: number) => `${value.toFixed(2)} ${aggregateUnit}`
  const totalWeight = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => Mixpanel.track('Pack:View breakdown')}
        >
          <PieChart size={12} />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Weight Breakdown</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row bg-card text-foreground px-6 py-6 gap-4">
          <div className="flex-1 h-96 min-w-0">
            <ResponsivePie
              data={chartData}
              margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
              valueFormat={valueFormat}
              activeOuterRadiusOffset={8}
              colors={chartColors}
              borderWidth={1}
              borderColor={isDark ? '#1b1913' : '#ffffff'}
              enableArcLinkLabels={true}
              arcLinkLabelsSkipAngle={8}
              arcLinkLabelsTextColor={isDark ? '#edecec' : '#334155'}
              arcLinkLabelsThickness={1}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLinkLabel={d =>
                `${d.label} (${((d.value / totalWeight) * 100).toFixed(1)}%)`
              }
              enableArcLabels={false}
              theme={{
                labels: {
                  text: { fontSize: 11 },
                },
                tooltip: {
                  container: { color: '#1a1a1a' },
                },
              }}
            />
          </div>
          <div className="sm:w-56 shrink-0 flex items-center">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-6"></th>
                  <th className="text-left font-semibold pb-1">
                    <button
                      type="button"
                      onClick={() => toggleSort('label')}
                      className="inline-flex items-center gap-1 select-none hover:text-foreground"
                      title="Sort by category"
                    >
                      Category <SortIcon column="label" />
                    </button>
                  </th>
                  <th className="text-right font-semibold pb-1">
                    <button
                      type="button"
                      onClick={() => toggleSort('value')}
                      className="inline-flex items-center gap-1 flex-row-reverse select-none hover:text-foreground"
                      title="Sort by weight"
                    >
                      Weight <SortIcon column="value" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(({ label, value, color }) => (
                  <tr key={label} className="border-b border-border">
                    <td className="py-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </td>
                    <td className="py-1.5">{label}</td>
                    <td className="text-right tabular-nums py-1.5">
                      {valueFormat(value)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-1.5"></td>
                  <td className="py-1.5 font-semibold">Total</td>
                  <td className="text-right tabular-nums py-1.5 font-semibold">
                    {`${totalWeight.toFixed(2)} ${aggregateUnit}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
