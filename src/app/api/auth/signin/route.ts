import dbConnect from '../../../../lib/mongodb';
import Employee from '../../../../models/employee';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { username, password } = await req.json();

  const employee = await Employee.findOne({ username });
  if (!employee) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }

  const isPasswordValid = await bcrypt.compare(password, employee.password);
  if (!isPasswordValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }

  const token = jwt.sign({ id: employee.employeeId }, JWT_SECRET, { expiresIn: '1h' });
  return NextResponse.json({ 
    message: 'Login successful', 
    token,
    employee: {
      employeeId: employee.employeeId,
      name: employee.name
    }
  }, { status: 200 });
}