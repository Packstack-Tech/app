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
}

export const PackWeights: FC<Props> = ({ title, weights }) => (
  <div className="text-sm mb-4">
    <Label className="block border-b font-semibold border-dashed">
      {title}
    </Label>
    <div className="flex justify-between">
      <p>Total</p>
      <p>{weights.total.toFixed(2)} kg</p>
    </div>
    <div className="flex justify-between">
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
  </div>
)
