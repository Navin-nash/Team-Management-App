import mongoose, { Schema, Document } from 'mongoose';

interface ITeam extends Document {
    teamId: string;
    teamName: string;
    members: string[]; // Array of employeeId strings
}

const TeamSchema = new Schema<ITeam>({
    teamId: { 
        type: String, 
        unique: true, 
        required: true 
    },
    teamName: { 
        type: String, 
        required: [true, 'Path `teamName` is required.'] 
    },
    members: [{ 
        type: String 
    }] // Storing employeeId as strings here
},{ timestamps: true });

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
