  // Types for team members and API responses
  interface TeamMember {
    _id: string;
    employeeId: string;
    name: string;
    username: string;
  }

  interface TeamMembersResponse {
    members: TeamMember[];
  }

  interface TeamDetailProps {
    teamId: string;
    teamName: string;
  }

  'use client';

  import { useEffect, useState } from 'react';
  import { Button } from '../components/ui/button';
  import { Card, CardContent } from '../components/ui/card';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '../components/ui/dialog';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

  export default function TeamDetail({ teamId, teamName }: TeamDetailProps) {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [availableEmployees, setAvailableEmployees] = useState<TeamMember[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

    useEffect(() => {
      setCurrentEmployeeId(localStorage.getItem('employeeId'));
      fetchTeamMembers();
      fetchAvailableEmployees();
    }, [teamId]);

    const fetchTeamMembers = async () => {
      const token = localStorage.getItem('token');
      try {
          if (!token) {
              throw new Error('User is not authenticated');
          }

          const response = await fetch(`/api/teams/${teamId}`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`, // Add the token here
                  'Content-Type': 'application/json'
              }
          });

          const data: TeamMembersResponse = await response.json();
          if (!response.ok) {
              throw new Error('Failed to fetch team members');
          }

          setMembers(data.members);
          setError(null);
      } catch (error) {
          console.error('Error fetching team members:', error);
          setError('You do not have permission to view this team');
      }
  };

    const fetchAvailableEmployees = async () => {
      try {
        const response = await fetch('/api/employees');
        const data: TeamMember[] = await response.json();

        if (!response.ok) {
          throw new Error('Failed to fetch available employees');
        }

        setAvailableEmployees(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching available employees:', error);
        setError('Failed to load available employees. Please try again.');
      }
    };

    const handleRemoveMember = async (employeeId: string) => {
      const token = localStorage.getItem('token');
  
      try {    
          if (!currentEmployeeId) {
              throw new Error('Current employee ID not found in local storage');
          }
  
          const response = await fetch(`/api/teams/${teamId}/removeMember`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                  teamId: teamId,
                  currentEmployeeId: currentEmployeeId, // Pass current employee ID 
                  employeeId: employeeId // Pass the selected employee ID to remove
              }),
          });
  
          if (!response.ok) {
              // Extract error message if available
              const errorData = await response.json();
              const errorMessage = errorData?.error || 'Failed to remove team member';
              throw new Error(errorMessage);
          }
  
          // Update local state on successful removal
          setMembers((prevMembers) =>
              prevMembers.filter((member) => member.employeeId !== employeeId)
          );
  
          // Optionally refresh the list of available employees
          await fetchAvailableEmployees();
          setError(null);
      } catch (error) {
          console.error('Error removing team member:', error);
          setError(error instanceof Error ? error.message : 'Failed to remove team member. Please try again.');
      }
  };
  
  
    const handleAddMember = async (employeeId: string) => {
      const token = localStorage.getItem('token');
      try {
        if (!currentEmployeeId) {
          throw new Error('Current employee ID not found');
        }
  
        const response = await fetch(`/api/teams/${teamId}/addMember`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamId: teamId,
            currentEmployeeId:currentEmployeeId,
            employeeId: employeeId
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add team member');
        }
  
        // Refresh both members and available employees lists
        await Promise.all([fetchTeamMembers(), fetchAvailableEmployees()]);
        
        setIsDialogOpen(false);
        setError(null);
      } catch (error) {
        console.error('Error adding team member:', error);
        setError(error instanceof Error ? error.message : 'Failed to add team member. Please try again.');
      }
    };
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <h1 className="text-xl md:text-2xl font-bold text-center sm:text-left">Team Members</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">Add member</Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] sm:w-full">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <Select onValueChange={(value) => setSelectedEmployeeId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.map((employee) => (
                    <SelectItem key={employee.employeeId} value={employee.employeeId}>
                      {employee.name} ({employee.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className="mt-4 w-full" 
                onClick={() => selectedEmployeeId && handleAddMember(selectedEmployeeId)}
              >
                Confirm
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error Alert Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 md:gap-4">
          {members.length === 0 ? (
            <p className="text-center text-gray-500">No members in this team.</p>
          ) : (
            members.map((member) => (
              <Card key={member._id}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                    <div className="text-center sm:text-left">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-black">
                        {member.username}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMember(member.employeeId)}
                      className="w-full sm:w-auto"
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }