import { FC } from 'react'
import { Chart } from 'react-google-charts'
import { PieChart } from 'lucide-react'

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
  const chartData = data.map(({ label, value }) => [label, value])
  chartData.unshift(['Category', 'Weight'])

  const aggregateUnit = data[0]?.unit || ''

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
        <Chart
          data={chartData}
          chartType="PieChart"
          width="100%"
          height="400px"
          formatters={[
            {
              type: 'NumberFormat',
              column: 1,
              options: {
                suffix: aggregateUnit,
              },
            },
          ]}
        />
      </DialogContent>
    </Dialog>
  )
}
