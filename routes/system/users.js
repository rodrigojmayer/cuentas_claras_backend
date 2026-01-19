import express from "express";
import User from "../../models/User.js";

const router = express.Router();

// 🤖 SISTEMA: crear usuario
// Create a user
router.post("/", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;