    import mongoose, { Schema, Document } from 'mongoose';

    export interface IEmployee extends Document {
        employeeId: string;
        name: string;
        username: string;
        password: string;
        teams: string[];
    }

    const EmployeeSchema = new Schema<IEmployee>({
        employeeId: {
            type: String,
            unique: true,
            required: true,
        },
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
    }, {
        timestamps: true
    });


    const Employee = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
    export default Employee;