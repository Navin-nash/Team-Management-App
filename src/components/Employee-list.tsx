'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'

interface Employee {
  employeeId: any
  _id: string;
  name: string;
  username: string;
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        if (!response.ok) {
          throw new Error('Failed to fetch employees')
        }
        const data = await response.json()
        setEmployees(data)
      } catch (error) {
        console.error('Error fetching employees:', error)
        setError('Failed to load employees')
      }
    }

    fetchEmployees()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee List</h1>
      </div>

      <div className="grid gap-4">
        {error && (
          <p className="text-red-600">{error}</p>
        )}
        {employees.map((employee) => (
            <Card className="hover:bg-slate-50 transition-colors">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold">{employee.name}</h2>
                <p className="text-sm text-gray-500">{employee.username}</p>
                <p className="text-gray-600 text-right">{employee.employeeId}</p>
              </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}