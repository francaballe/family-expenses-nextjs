import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
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
if (mongoose.models.Group) {
    delete mongoose.models.Group;
}

// Registrar el modelo
const Group = mongoose.model("Group", groupSchema);

export default Group;
