import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    name: String,
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index(
    { phone: 1 },
    { unique: true, partialFilterExpression: { phone: { $type: "string", $ne: "" } } }
);

export default mongoose.model("User", userSchema);