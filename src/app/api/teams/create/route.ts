import mongoose from 'mongoose';
import dbConnect from '../../../../lib/mongodb';
import Team from '../../../../models/Team';
import Employee from '../../../../models/employee';
import { NextRequest, NextResponse } from 'next/server';

async function generateUniqueTeamId() {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const prefix = `TM${currentYear}`;
    
    const latestTeam = await Team.findOne({}, { teamId: 1 }).sort({ teamId: -1 }).lean();
    let nextNumber = 1;
    if (latestTeam && typeof latestTeam === 'object' && 'teamId' in latestTeam) {
        const lastNumber = parseInt(latestTeam.teamId.slice(-4));
        nextNumber = lastNumber + 1;
    }
    
    const teamId = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    return teamId;
}

export async function POST(req: NextRequest) {
    const { teamName, employeeId } = await req.json();
  

    if (!teamName || !employeeId) {
        return NextResponse.json(
            { error: 'Team name and employee ID are required' },
            { status: 400 }
        );
    }

    try {
        await dbConnect();
        const employee = await Employee.findOne({ employeeId: employeeId });
      

        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found' },
                { status: 404 }
            );
        }

        const teamId = await generateUniqueTeamId();
        

        const newTeam = await Team.create({
            teamId,
            teamName,
            members: [employeeId],
        });

        employee.teams.push(newTeam._id); 
        await employee.save();

        return NextResponse.json(
            { 
                message: 'Team and collection created', 
                team: newTeam 
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating team and collection:', error);
        return NextResponse.json(
            { error: 'Error creating team and collection' },
            { status: 500 }
        );
    }
}