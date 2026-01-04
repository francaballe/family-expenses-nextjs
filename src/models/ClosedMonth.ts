import mongoose from 'mongoose';

const closedMonthSchema = new mongoose.Schema({
    monthandyear: { type: String, required: true },
    groupid: { type: Number, required: true, ref: "Group" }
},
    { versionKey: false, timestamps: true }
);

const ClosedMonth = mongoose.models.ClosedMonth || mongoose.model("ClosedMonth", closedMonthSchema);

export default ClosedMonth;
