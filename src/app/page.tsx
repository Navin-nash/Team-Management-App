'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'

export default function HomePage() {
  const router = useRouter()

  // This is a placeholder for authentication check
  // In a real application, you would use a proper auth mechanism
  const isAuthenticated = false

  useEffect(() => {
    // If user is authenticated, redirect to teams page
    if (isAuthenticated) {
      router.push('/teams')
    }
  }, [isAuthenticated, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome to Team Management</CardTitle>
          <CardDescription>Manage your teams and employees efficiently</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => router.push('/login')} className="w-full">
            Login
          </Button>
          <Button onClick={() => router.push('/signup')} variant="outline" className="w-full">
            Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}