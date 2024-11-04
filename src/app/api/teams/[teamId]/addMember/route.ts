import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { withTeamAuth } from '../../../../../middleware/auth';
import Team from '../../../../../models/Team';
import Employee from '../../../../../models/employee';
import dbConnect from '../../../../../lib/mongodb';

export const POST = withTeamAuth(async (request: NextRequest, user) => {
    try {
        await dbConnect();
        
        const body = await request.json();
        const { teamId, employeeId, currentEmployeeId } = body;

        if (!teamId || !employeeId || !currentEmployeeId) {
            return NextResponse.json({ 
                error: 'TeamId, employeeId, and currentEmployeeId are all required' 
            }, { status: 400 });
        }
        let objectId;
        try {
            objectId = new ObjectId(teamId);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid team ID format' }, { status: 400 });
        }


        const employeeToAdd = await Employee.findOne({ employeeId: employeeId });
        if (!employeeToAdd) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        const team = await Team.findById(objectId);
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        if (team.members.includes(employeeId)) {
            return NextResponse.json({ 
                error: 'Employee is already a member of this team' 
            }, { status: 400 });
        }

        team.members.push(employeeId);
        await team.save();

        employeeToAdd.teams.push(objectId);
        await employeeToAdd.save();

        return NextResponse.json({ 
            message: 'Employee added to team',
            team: team,
            employee: employeeToAdd
        }, { status: 200 });

    } catch (error) {
        console.error('Error in team member addition:', error);
        return NextResponse.json({ 
            error: 'Error adding member to team',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
});