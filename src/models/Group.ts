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

// Asegurar que el modelo se registre una sola vez
const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);

export default Group;
