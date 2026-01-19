import express from "express";
import mongoose from "mongoose";
import User from "../../models/User.js";
import Debt from "../../models/Debt.js";

const router = express.Router();


// Get all users
router.get("/", async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// Get a single user by _id
router.get("/:id", async (req, res) => {
    const { id } = req.params

    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Find the user by ID
        const user = await User.findById(id);

        // Handle not found case
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Success
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user
router.patch("/:id_user", async (req, res) => {
    const { id_user } = req.params
    const { email, phone, name, enabled, deleted } = req.body

    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id_user)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        const updateData = { ...req.body }
        if(email){
            // Regular expression to validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                console.log("Invalid email format")
                return res.status(400).json({ error: 'Invalid email format', field: "email", errorCode: `invalid_email_format` })
            }
        }

        // Find the user by ID
        const user = await User.findOneAndUpdate(
            { _id: id_user },
            updateData,
            { new: true, runValidators: true }
        )

        if(!user) {
            return res.status(404).json({ error: "No such user" });
        }

        res.json(user);

    } catch (err) {
        if (err.name === "MongoServerError" && err.code === 11000) { // For duplicated email or user
            const duplicateKey = Object.keys(err.keyPattern)[0];
            const duplicateValue = err.keyValue[duplicateKey];
            return res.status(400).json({ error: `${duplicateKey} '${duplicateValue}' already exists`, field: duplicateKey, errorCode: `${duplicateKey}_duplicated` });
        } else if (err.name === "ValidationError") {
            const fieldName = Object.keys(err.errors)[0];
            const errorMessage = err.errors[fieldName].message;
            return res.status(400).json({ error: errorMessage, field: fieldName, errorCode: `invalid_${fieldName}_format` });
        }
        res.status(500).json({ error: err.message });
    }
});

// Delete user
router.delete("/:id_user", async (req, res) => {
    const { id_user } = req.params

    try {
        if(!mongoose.Types.ObjectId.isValid(id_user)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        
        // Check if user is involved in any debt (as creditor or debtor)
        const isAssigned = await Debt.exists({
            $or: [
                { id_user_creditor: id_user },
                { id_user_debtor: id_user }
            ]
        });

        if (isAssigned) {
            return res.status(400).json({
                error: "User cannot be deleted - assigned to one or more debts",
                message: `At least is assigned to the debt ${isAssigned._id}`
            })
        }

        // Delete the user if not assigned
        const deletedUser = await User.findOneAndDelete({ _id: id_user });

        if(!deletedUser) {
            return res.status(404).json({ error: "No such user" });
        }

        res.status(200).json({
            message: "User deleted successfully",
            deletedUser
        });

    } catch (err) {
        console.error("Error deleting user: ", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;