'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import { Users } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()

  return (
    <div className="grid lg:grid-cols-5 min-h-screen">
      {/* Sidebar */}
      <div className="hidden lg:block bg-blue-600 text-white p-6">
        <div className="flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">wecommit</h1>
          </div>
          <ScrollArea className="flex-grow">
            <nav className="space-y-2">
              <Link href="/teams">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:text-white hover:bg-blue-700",
                    pathname === '/teams' && "bg-blue-700"
                  )}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Team List
                </Button>
              </Link>
              
              <div className="pt-4 pb-2">
                <h2 className="px-2 text-lg font-semibold">Employees</h2>
              </div>
              <Link href="/employees">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:text-white hover:bg-blue-700",
                    pathname === '/employees' && "bg-blue-700"
                  )}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Employee List
                </Button>
              </Link>
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50">
        <nav className="flex justify-around">
          <Link href="/teams">
            <Button
              variant="ghost"
              className={cn(
                "text-white hover:text-white hover:bg-blue-700",
                pathname === '/teams' && "bg-blue-700"
              )}
            >
              <Users className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/employees">
            <Button
              variant="ghost" 
              className={cn(
                "text-white hover:text-white hover:bg-blue-700",
                pathname === '/employees' && "bg-blue-700"
              )}
            >
              <Users className="h-5 w-5" />
            </Button>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="col-span-1 lg:col-span-4 h-full pb-16 lg:pb-0">
        {children}
      </div>
    </div>
  )
}