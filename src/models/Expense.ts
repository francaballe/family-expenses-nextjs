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

const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

export default Expense;
