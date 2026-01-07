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

// Limpiar el modelo existente si existe
if (mongoose.models.Role) {
    delete mongoose.models.Role;
}

// Registrar el modelo
const Role = mongoose.model("Role", roleSchema);

export default Role;
