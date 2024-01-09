import { FC } from 'react'

import { LegacyPacks } from '@/containers/LegacyPacks'
import { PackingLists } from '@/containers/PackingLists'
import { useUser } from '@/hooks/useUser'
import { useUnassignedPacks } from '@/queries/pack'

export const Dashboard: FC = () => {
  const user = useUser()
  const { data: legacyPacks } = useUnassignedPacks()

  return (
    <div className="mx-2 md:max-w-lg md:mx-auto my-8">
      <PackingLists trips={user.trips || []} />
      <LegacyPacks packs={legacyPacks || []} />
    </div>
  )
}
