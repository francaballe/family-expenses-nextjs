import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userroleid: { type: Number, required: true, ref: "Role" },
    isblocked: { type: Boolean, required: true, default: false },
    groupid: { type: Number, required: true, ref: "Group" },
    createdAt: { type: String, required: true },
    lastlogin: { type: String, default: null },
},
    { versionKey: false, timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
