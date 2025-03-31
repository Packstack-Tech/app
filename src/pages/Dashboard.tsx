import { FC } from 'react'

import { PackingLists } from '@/containers/PackingLists'
import { useUser } from '@/hooks/useUser'

export const Dashboard: FC = () => {
  const user = useUser()

  return (
    <div className="mx-2 md:max-w-lg md:mx-auto my-8">
      <PackingLists trips={user.trips || []} />
    </div>
  )
}
