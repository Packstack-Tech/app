import { FC } from 'react'
import { FlameIcon } from 'lucide-react'

import { Label } from '@/components/ui/Label'
import { Unit } from '@/types/item'

type Props = {
  title: string
  weights: {
    worn: number
    consumable: number
    total: number
    base: number
  }
  calories: number
  aggregateWeightUnit: Unit
}

export const PackWeights: FC<Props> = ({
  title,
  weights,
  calories,
  aggregateWeightUnit,
}) => (
  <div className="text-sm mb-4 rounded-lg border border-border bg-muted/30 overflow-hidden">
    <div className="bg-muted/50 px-3 py-2 border-b border-border">
      <Label className="font-semibold text-foreground">{title}</Label>
    </div>
    <div className="px-3 py-1.5 space-y-0.5">
      <div className="flex justify-between py-0.5">
        <p className="text-muted-foreground">Base</p>
        <p>
          {weights.base.toFixed(2)} {aggregateWeightUnit}
        </p>
      </div>
      <div className="flex justify-between py-0.5">
        <p className="text-muted-foreground">Worn</p>
        <p>
          {weights.worn.toFixed(2)} {aggregateWeightUnit}
        </p>
      </div>
      <div className="flex justify-between py-0.5">
        <p className="text-muted-foreground">Consumable</p>
        <p>
          {weights.consumable.toFixed(2)} {aggregateWeightUnit}
        </p>
      </div>
      <div className="flex justify-between py-0.5 border-t border-border mt-1 pt-1">
        <p className="font-semibold text-primary">Total</p>
        <p className="font-semibold text-primary">
          {weights.total.toFixed(2)} {aggregateWeightUnit}
        </p>
      </div>
      {calories > 0 && (
        <div className="flex justify-between items-center py-0.5 border-t border-dashed border-border mt-1 pt-1">
          <p className="inline-flex items-center gap-1 text-orange-400">
            <FlameIcon size={14} />
            Calories
          </p>
          <p className="text-orange-400 font-semibold">
            {Math.round(calories).toLocaleString()} kcal
          </p>
        </div>
      )}
    </div>
  </div>
)
