import mongoose from 'mongoose';

const closedMonthSchema = new mongoose.Schema({
    monthandyear: { type: String, required: true },
    groupid: { type: Number, required: true, ref: "Group" }
},
    { versionKey: false, timestamps: true }
);

// Limpiar el modelo existente si existe
if (mongoose.models.ClosedMonth) {
    delete mongoose.models.ClosedMonth;
}

// Registrar el modelo
const ClosedMonth = mongoose.model("ClosedMonth", closedMonthSchema);

export default ClosedMonth;
