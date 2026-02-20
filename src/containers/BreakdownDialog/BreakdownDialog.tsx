import { FC } from 'react'
import { PieChart } from 'lucide-react'
import { ResponsivePie } from '@nivo/pie'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { Mixpanel } from '@/lib/mixpanel'
import { CategoryWeight } from '@/types/category'

interface Props {
  data: CategoryWeight[]
}

export const BreakdownDialog: FC<Props> = ({ data }) => {
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
  const chartData = data.map(({ label, value }) => {
    return {
      id: label,
      label: label,
      value: value,
    }
  })

  const aggregateUnit = data[0]?.unit || ''
  const valueFormat = (value: number) => `${value.toFixed(2)} ${aggregateUnit}`
  const totalWeight = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex gap-1 text-xs items-center text-primary active:text-white"
          onClick={() => Mixpanel.track('Pack:View breakdown')}
        >
          <PieChart size={12} /> View breakdown
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Weight Breakdown</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row bg-white text-slate-900 px-6 py-6 gap-4">
          <div className="flex-1 h-96 min-w-0">
            <ResponsivePie
              data={chartData}
              margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
              valueFormat={valueFormat}
              activeOuterRadiusOffset={8}
              colors={chartColors}
              borderWidth={1}
              borderColor="#ffffff"
              enableArcLinkLabels={true}
              arcLinkLabelsSkipAngle={8}
              arcLinkLabelsTextColor="#334155"
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
              }}
            />
          </div>
          <div className="sm:w-56 shrink-0 flex items-center">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-6"></th>
                  <th className="text-left font-semibold pb-1">Category</th>
                  <th className="text-right font-semibold pb-1">Weight</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map(({ label, value }, index) => (
                  <tr key={label} className="border-b border-slate-100">
                    <td className="py-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            chartColors[index % chartColors.length],
                        }}
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
