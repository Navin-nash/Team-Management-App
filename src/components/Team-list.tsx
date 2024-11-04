'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import Link from 'next/link'

interface Team {
  _id:string;
  teamName: string;
  members: string[];
}

export default function TeamList() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams')
        if (!response.ok) {
          throw new Error('Failed to fetch teams')
        }
        const data = await response.json()
        // Map teamName to name for frontend display consistency
        const sanitizedTeams = data.map((team: any) => ({
          ...team,
          name: team.teamName || team.name, // Use teamName if available
          members: team.members || []
        }))
        setTeams(sanitizedTeams)
      } catch (error) {
        console.error('Error fetching teams:', error)
        setError('Failed to load teams')
      }
    }

    fetchTeams()
  }, [])

  const [newTeamName, setNewTeamName] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const employeeId = localStorage.getItem('employeeId')
      
      if (!employeeId) {
        throw new Error('Employee ID not found. Please log in again.')
      }

      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: newTeamName, // Use teamName here to match backend schema
          employeeId: employeeId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create team')
      }

      const { team: newTeam } = await response.json()
      const sanitizedNewTeam = {
        ...newTeam,
        name: newTeam.teamName || newTeam.name, // Map teamName for consistency
        members: newTeam.members || []
      }
      setTeams(prevTeams => [...prevTeams, sanitizedNewTeam])
      setNewTeamName('')
      setIsOpen(false)
    } catch (error) {
      console.error('Error creating team:', error)
      setError(error instanceof Error ? error.message : 'Failed to create team')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team List</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              Create team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team name</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                  required
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {error && (
          <p className="text-red-600">{error}</p>
        )}
        {teams.map((team) => (
          <Link key={team._id} href={`/teams/${team._id}`}>
            <Card className="hover:bg-slate-50 transition-colors">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold">{team.teamName}</h2>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
