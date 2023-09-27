import { Unit } from "@/types/item"
import { Label } from "@radix-ui/react-label"
import { FC } from "react"

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
    <Label className="block border-b font-semibold border-dashed">
      {title}
    </Label>
    <div className="flex justify-between hover:bg-slate-900">
      <p>Base</p>
      <p>{weights.base.toFixed(2)} kg</p>
    </div>
    <div className="flex justify-between">
      <p>Worn</p>
      <p>{weights.worn.toFixed(2)} kg</p>
    </div>
    <div className="flex justify-between">
      <p>Consumable</p>
      <p>{weights.consumable.toFixed(2)} kg</p>
    </div>
    <div className="flex justify-between">
      <p className="text-primary">Total</p>
      <p className="text-primary">
        {weights.total.toFixed(2)} {aggregateWeightUnit}
      </p>
    </div>
  </div>
)
