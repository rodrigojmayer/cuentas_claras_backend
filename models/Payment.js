import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    id_debt: { type: mongoose.Schema.Types.ObjectId, ref: "Debt", required: true },
    amount: { type: Number, required: true, min: 0 },
    pending: { type: Number, required: true, min: 0 },
    date_payment: { type: Date, default: Date.now },
    dolar_google: Number,
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);