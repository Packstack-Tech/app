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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Weight Breakdown</DialogTitle>
        </DialogHeader>
        <div className="w-full h-80 bg-white text-slate-900">
          <ResponsivePie
            data={chartData}
            margin={{ top: 24, right: 24, bottom: 24, left: 24 }}
            valueFormat={valueFormat}
            activeOuterRadiusOffset={8}
            colors={chartColors}
            borderWidth={1}
            borderColor="#ffffff"
            enableArcLinkLabels={false}
            // innerRadius={0.4}
            arcLabelsRadiusOffset={0.8}
            arcLabelsTextColor="#ffffff"
            arcLabel={e => `${((e.value / totalWeight) * 100).toFixed(1)}%`}
            theme={{
              legends: {
                text: {
                  fontSize: 12,
                },
              },
            }}
          />
        </div>
        <div className="bg-white text-slate-900 text-sm p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-6"></th>
                <th className="text-left">Category</th>
                <th className="text-right">Weight</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map(({ label, value }, index) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          chartColors[index % chartColors.length],
                      }}
                    ></div>
                  </td>
                  <td className="py-1">{label}</td>
                  <td className="text-right tabular-nums py-1">
                    {valueFormat(value)}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-1"></td>
                <td className="py-1">Total</td>
                <td className="text-right tabular-nums pt-1">
                  {`${totalWeight.toFixed(2)} ${aggregateUnit}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
