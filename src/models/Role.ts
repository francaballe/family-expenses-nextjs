import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    _id: Number,
    name: { type: String, required: true },
},
    { versionKey: false, timestamps: true }
);

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;
