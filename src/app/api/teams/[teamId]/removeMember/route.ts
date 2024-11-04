import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { withTeamAuth } from '../../../../../middleware/auth';
import Team from '../../../../../models/Team';
import Employee from '../../../../../models/employee';
import dbConnect from '../../../../../lib/mongodb';

export const DELETE = withTeamAuth(async (request: NextRequest, user) => {
    try {
        await dbConnect();

        const body = await request.json();
        const {teamId, employeeId, currentEmployeeId } = body;

        // Validate all required fields
        if (!employeeId || !currentEmployeeId) {
            return NextResponse.json({ 
                error: 'EmployeeId and currentEmployeeId are both required' 
            }, { status: 400 });
        }
        // Validate teamId format
        let objectId;
        try {
            objectId = new ObjectId(teamId);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid team ID format' }, { status: 400 });
        }

        // Verify the employee to be removed exists
        const employeeToRemove = await Employee.findOne({ employeeId });
        if (!employeeToRemove) {
            return NextResponse.json({ error: 'Employee to remove not found' }, { status: 404 });
        }

        // Get the team
        const team = await Team.findById(objectId);
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Verify if currentEmployeeId exists in the database
        const currentEmployee = await Employee.findOne({ employeeId: currentEmployeeId });
        if (!currentEmployee) {
            return NextResponse.json({ error: 'Current employee not found' }, { status: 404 });
        }

        // Check if the employee to be removed is a member of the team
        if (!team.members.includes(employeeId)) {
            return NextResponse.json({ 
                error: 'Employee is not a member of this team' 
            }, { status: 400 });
        }

        // Remove employee from team
        team.members = team.members.filter((id: any) => id !== employeeId);
        await team.save();

        // Remove team from the employee's teams array
        employeeToRemove.teams = employeeToRemove.teams.filter((id: any) => !id.equals(objectId));
        await employeeToRemove.save();

        return NextResponse.json({ 
            message: 'Employee removed from team',
            team: team,
            employee: employeeToRemove
        }, { status: 200 });

    } catch (error) {
        console.error('Error in team member removal:', error);
        return NextResponse.json({ 
            error: 'Error removing member from team',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
});