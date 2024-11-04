import dbConnect from '../../../lib/mongodb';
import { NextResponse } from 'next/server';
import Employee from '../../../models/employee'; 

export async function GET() {
    try {
        await dbConnect();

        const employees = await Employee.find({}, 'employeeId name username');
        return NextResponse.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json(
            { error: 'Error fetching employees' },
            { status: 500 }
        );
    }
}
