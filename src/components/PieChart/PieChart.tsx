import { CategoryPackItems } from "@/types/category"
import { FC } from "react"
import { ChartData } from "@/types/data"
import { Doughnut } from "react-chartjs-2"

interface Props {
  data: CategoryPackItems[]
}

type ChartItterator = {
  labels: string[]
  data: number[]
}

export const CategoryPieChart: FC<Props> = ({ data }) => {
  /* eslint-ignore */
  const chartData = data.reduce((acc, category) => {
    const categoryWeight = category.items.reduce((acc, { item }) => {
      const w = item.weight
        ? item.unit === "kg"
          ? item.weight
          : item.weight / 1000
        : 0
      return acc + w
    }, 0)
    return {
      labels: [...acc.labels, category.category?.category || "Uncategorized"],
      data: [...acc.data, categoryWeight],
    }
  }, {} as ChartItterator)
}
