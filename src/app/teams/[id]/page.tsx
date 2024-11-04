'use client'

import { useParams } from 'next/navigation'
import TeamDetail from '@/src/components/Team-details'
import Layout from '@/src/components/layout'

export default function TeamDetailPage() {
  const params = useParams()
  const teamId = params.id as string

  const teamName = "Team Name"
  return (
    <Layout>
      <TeamDetail teamId={teamId} teamName={teamName} />
    </Layout>
  )
}