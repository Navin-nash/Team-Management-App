import { NextRequest, NextResponse } from 'next/server';
import Team from '../../../../models/Team';
import Employee from '../../../../models/employee';
import dbConnect from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { withTeamAuth } from '../../../../middleware/auth';

export const GET = withTeamAuth(async (request: NextRequest, user) => {
    const teamId = request.url.split('/').pop();

    try {
        await dbConnect();

        const team = await Team.findById(teamId);
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }
   
        const currentEmployee = await Employee.findOne({ employeeId: user.id });
        if (!currentEmployee || !currentEmployee.teams.includes(new ObjectId(teamId))) {
            return NextResponse.json({ error: 'You do not have permission' }, { status: 403 });
        }

        const employees = await Employee.find({
            teams: new ObjectId(teamId)
        }).select('employeeId name username');
    
        const membersWithDetails = employees.map(member => ({
            _id: member._id,
            employeeId: member.employeeId,
            name: member.name,
            username: member.username
        }));

        return NextResponse.json({ members: membersWithDetails });
    } catch (error) {
        console.error('Error fetching team details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
});