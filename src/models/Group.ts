import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    _id: Number,
    name: { type: String, required: true },
},
    { versionKey: false, timestamps: true }
);

const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);

export default Group;
