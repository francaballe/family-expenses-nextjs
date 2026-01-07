import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    name: { type: String, required: true },
},
    { 
        _id: false, // Usamos _id personalizado
        versionKey: false, 
        timestamps: true 
    }
);

// Asegurar que el modelo se registre una sola vez
const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;
