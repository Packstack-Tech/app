import { FC } from "react"
// import { BarChart3 } from "lucide-react"
import { Unit } from "@/types/item"
import { Label } from "@radix-ui/react-label"
import { PackItem } from "@/types/pack"
import { useCategorizedPackItems } from "@/hooks/useCategorizedPackItems"
import { useCategorizedWeights } from "@/hooks/useCategorizedWeights"

type Props = {
  title: string
  weights: {
    worn: number
    consumable: number
    total: number
    base: number
  }
  aggregateWeightUnit: Unit
  items?: PackItem[]
}

export const PackWeights: FC<Props> = ({
  title,
  weights,
  aggregateWeightUnit,
  items,
}) => {
  const categorizedItems = useCategorizedPackItems(items || [])
  const categorizedWeights = useCategorizedWeights(categorizedItems)

  console.log(categorizedWeights)

  return (
    <div className="text-sm mb-4">
      <div className="border-b items-center border-dashed flex justify-between pb-0.5">
        <Label className="font-semibold text-white">{title}</Label>
        {/* <button className="text-xs flex items-center gap-1 hover:text-primary">
          <BarChart3 size={16} /> View breakdown
        </button> */}
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
}
