import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
    id_debt: { type: mongoose.Schema.Types.ObjectId, ref: "Debt", required: true },
    date_alert: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
}, { tymestamps: true });

export default mongoose.model("Alert", alertSchema);