import { FC } from 'react'

import { PackingLists } from '@/containers/PackingLists'
import { useUser } from '@/hooks/useUser'

export const Dashboard: FC = () => {
  const user = useUser()

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <PackingLists trips={user.trips || []} />
    </div>
  )
}
