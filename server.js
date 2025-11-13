import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import debtRoutes from "./routes/debts.js";
import userRoutes from "./routes/users.js";
import alertRoutes from "./routes/alerts.js";
import paymentRoutes from "./routes/payments.js";

dotenv.config();
const app = express();
app.use(cors({
  origin: process.env.NEXT_FRONTEND_URL, // your Next.js frontend
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true, // if you use cookies or auth
}));
app.use(express.json());
app.use("/api/debts", debtRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/payments", paymentRoutes);

// Connect Mongo
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// Routes placeholder
app.get("/", (req, res) => res.send("Debts API is running"));

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

