import { FC } from "react"

import { useUserQuery } from "@/queries/user"
import { useUnassignedPacks } from "@/queries/pack"

import { LegacyPacks } from "@/containers/LegacyPacks"
import { PackingLists } from "@/containers/PackingLists"

export const Dashboard: FC = () => {
  const { data } = useUserQuery()
  const { data: legacyPacks } = useUnassignedPacks()

  return (
    <div className="max-w-lg mx-auto my-8">
      <PackingLists trips={data?.trips || []} />
      <LegacyPacks packs={legacyPacks || []} />
    </div>
  )
}
