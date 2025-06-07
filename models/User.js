import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true },
    name: String,
    enabled: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);