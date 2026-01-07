import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    expensedate: { type: Date, default: Date.now },
    duedate: { type: Date },
    comments: { type: String }
},
    { versionKey: false, timestamps: true }
);

// Limpiar el modelo existente si existe
if (mongoose.models.Expense) {
    delete mongoose.models.Expense;
}

// Registrar el modelo
const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
