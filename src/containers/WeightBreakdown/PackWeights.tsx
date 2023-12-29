import { FC } from 'react'
import { Label } from '@radix-ui/react-label'

import { Unit } from '@/types/item'

type Props = {
  title: string
  weights: {
    worn: number
    consumable: number
    total: number
    base: number
  }
  aggregateWeightUnit: Unit
}

export const PackWeights: FC<Props> = ({
  title,
  weights,
  aggregateWeightUnit,
}) => (
  <div className="text-sm mb-4">
    <div className="border-b items-center border-dashed flex justify-between pb-0.5">
      <Label className="font-semibold text-white">{title}</Label>
    </div>
    <div className="flex justify-between hover:bg-slate-900">
      <p>Base</p>
      <p>
        {weights.base.toFixed(2)} {aggregateWeightUnit}
      </p>
    </div>
    <div className="flex justify-between">
      <p>Worn</p>
      <p>
        {weights.worn.toFixed(2)} {aggregateWeightUnit}
      </p>
    </div>
    <div className="flex justify-between">
      <p>Consumable</p>
      <p>
        {weights.consumable.toFixed(2)} {aggregateWeightUnit}
      </p>
    </div>
    <div className="flex justify-between">
      <p className="text-primary">Total</p>
      <p className="text-primary">
        {weights.total.toFixed(2)} {aggregateWeightUnit}
      </p>
    </div>
  </div>
)
