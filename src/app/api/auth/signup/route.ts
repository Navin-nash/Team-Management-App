import dbConnect from '../../../../lib/mongodb';
import Employee from '../../../../models/employee';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

async function generateEmployeeId() {
  const counter = await Counter.findByIdAndUpdate(
    'employeeId',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return `EMP${counter.sequence_value.toString().padStart(6, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, username, password } = await req.json();
    
    const employeeId = await generateEmployeeId();
    console.log('Generated employeeId:', employeeId);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      employeeId: employeeId,
      name: name,
      username: username,
      password: hashedPassword,
      teams: []
    });

    const savedEmployee = await newEmployee.save();
    
    console.log('Saved employee:', {
      id: savedEmployee._id,
      employeeId: savedEmployee.employeeId,
      username: savedEmployee.username
    });
    const verifiedEmployee = await Employee.findById(savedEmployee._id);
    console.log('Verified employee:', {
      id: verifiedEmployee._id,
      employeeId: verifiedEmployee.employeeId,
      username: verifiedEmployee.username
    });

    if (!verifiedEmployee.employeeId) {
      throw new Error('Employee saved but employeeId not generated');
    }

    return NextResponse.json({
      message: 'Employee created',
      employee: {
        id: savedEmployee._id,
        employeeId: savedEmployee.employeeId,
        name: savedEmployee.name,
        username: savedEmployee.username
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { error: 'Error creating employee', details: (error as Error).message },
      { status: 400 }
    );
  }
}