import mongoose from "mongoose";

const debtSchema = new mongoose.Schema({
    id_user_creditor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required:true },
    id_user_debtor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date_debt: { type: Date, default: Date.now },
    detail: String,
    initial_amount: { type: Number, required: true, min: 0, max: 1000000000  },
    amount: { type: Number, required: true, min: 0, max: 1000000000  },
    dolar_google: Number,
    status: { type: String, enum: ["open", "closed", "overdue"], default: "open" },
    date_due: Date,
    alert_enabled: { type: Boolean, default: true },
    alerted: { type: Boolean, default: false },
    currency: { type: String, default: "ARS" },
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
}, { typestamps: true });

// Virtual field to link payments by id_debt
debtSchema.virtual("payments", {
    ref: "Payment",
    localField: "_id",
    foreignField: "id_debt",
});

debtSchema.virtual("alerts", {
    ref: "Alert",
    localField: "_id",
    foreignField: "id_debt",
});

// Enable virtuals in JSON responses
debtSchema.set("toObject", { virtuals: true });
debtSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Debt", debtSchema);