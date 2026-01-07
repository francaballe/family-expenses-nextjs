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

// Limpiar el modelo existente si existe
if (mongoose.models.User) {
    delete mongoose.models.User;
}

// Registrar el modelo
const User = mongoose.model("User", userSchema);

export default User;
