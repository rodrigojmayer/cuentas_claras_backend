import mongoose from "mongoose";

const debtSchema = new mongoose.Schema({
    id_user_creditor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required:true },
    id_user_debtor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date_debt: { type: Date, default: Date.now },
    detail: String,
    amount: { type: Number, required: true, min: 0 },
    dolar_google: Number,
    status: { type: String, enum: ["open", "closed", "overdue"], default: "open" },
    date_due: Date,
    currency: { type: String, default: "ARS" },
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
}, { typestamps: true });

export default mongoose.model("Debt", debtSchema);