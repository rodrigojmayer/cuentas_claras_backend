import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import userAuth from "./middlewares/userAuth.js";
import systemAuth from "./middlewares/systemAuth.js";

import googleAuth from "./routes/googleAuth.js";


import privateUsers from "./routes/private/users.js";
import debtRoutes from "./routes/private/debts.js";
import alertRoutes from "./routes/private/alerts.js";
import paymentRoutes from "./routes/private/payments.js";
import adminTests from "./routes/admin/tests.js";
// import checkAuth from "./middlewares/userAuth.js";

// import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();
app.use(cors({
  origin: process.env.NEXT_FRONTEND_URL, // your Next.js frontend
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true, // if you use cookies or auth
}));

app.use(express.json());
// 🌍 Público

app.use("/api/auth/google", googleAuth);

// app.use("/api/public/users", publicUsers);


// 🔐 Privado
app.use("/api/private/users", userAuth, privateUsers);
app.use("/api/private/debts", userAuth, debtRoutes);
app.use("/api/private/alerts", userAuth, alertRoutes);
app.use("/api/private/payments", userAuth, paymentRoutes);

// 👑 Admin
app.use("/api/admin/tests", userAuth, adminTests);

// Connect Mongo
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// Routes placeholder
app.get("/", (req, res) => res.send("Debts API is running"));

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

