import dbConnect from '../../../lib/mongodb';
import Team from '../../../models/Team';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const teams = await Team.find({}, 'teamName');
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Error fetching teams' },
      { status: 500 }
    );
  }
}
