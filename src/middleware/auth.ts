import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import Employee from '../models/employee';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface JWTPayload {
  id: string;
}

// Team-specific authentication middleware
export function withTeamAuth(handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      let teamId: string | undefined;

      // Extract teamId based on the request method
      if (req.method === 'POST' || req.method === 'DELETE') {
        // Parse JSON body for teamId in POST requests
        const body = await req.json();
        teamId = body.teamId;

        if (!teamId) {
          return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
        }

        // Re-create the request with the preserved body
        req = new NextRequest(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(body)
        });
      } else {
        // For GETrequests, extract teamId from the URL
        if (req.method === 'GET') {
          teamId = req.url.split('/').pop();
        }
      }

      // Validate teamId existence
      if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
      }

      // Check if the teamId is a valid ObjectId
      if (!ObjectId.isValid(teamId)) {
        return NextResponse.json({ error: 'Invalid team ID format' }, { status: 400 });
      }

      // Find the employee by decoded ID
      const employee = await Employee.findOne({ employeeId: decoded.id });

      // Check if the employee exists and has the teamId in their teams array
      if (!employee || !employee.teams.includes(new ObjectId(teamId))) {
        return NextResponse.json({ error: 'Not authorized to access this team' }, { status: 403 });
      }

      // Invoke the handler with authorized user and request
      return handler(req, decoded);
      
    } catch (error) {
      console.error('Middleware auth error:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}
