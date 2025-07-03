import express from "express";
import mongoose from "mongoose";
import Alert from "../models/Alert.js";

const router = express.Router();

// Create an alert
router.post("/", async (req, res) => {
    try {
        const alert = new Alert(req.body);
        await alert.save();
        res.status(201).json(alert);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all alerts
router.get("/", async (req, res) => {
    const alerts = await Alert.find({});
    res.json(alerts);
})

// Get a single alert by _id
router.get("/:id", async (req, res) => {
    const { id } = req.params
    
    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid alert ID" });
        }
        
        // Find the alert by ID
        const alert = await Alert.findById(id);

        // Handle not found case
        if (!alert) {
            return res.status(404).json({ error: "Alert not found" });
        }

        // Success
        res.json(alert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get alerts by debt
router.get("/debt/:id_debt", async (req, res) => {
    const { id_debt } = req.params

    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id_debt)) {
            return res.status(400).json({ error: "Invalid debt ID" });
        }

        // Find the alerts by debt ID
        const alerts = await Alert.find({ id_debt });

        // Check if the array is empty or null
        if(!alerts || alerts.length === 0) {
            return res.status(404).json({ error: "No alerts found for this debt" });
        }

        // Success
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update alert
router.patch("/:id_alert", async (req, res) => {
    const { id_alert } = req.params
    const { id_debt, date_alert, sent, enabled, deleted } = req.body

    try {
        if(!mongoose.Types.ObjectId.isValid(id_alert)) {
            return res.status(400).json({ error: "Invalid alert ID" });
        }
        
        const updateData = { id_debt, date_alert, sent, enabled, deleted };
        const alert = await Alert.findOneAndUpdate(
            { _id: id_alert },
            updateData,
            { new: true, runValidators: true }
        )
        if(!alert) {
            return res.status(404).json({ error: "No such alert" });
        }
        
        res.json(alert);

    } catch (err) {
        if(err.name === "ValidationError") {
            const fieldName = Object.keys(err.errors)[0];
            const errorMessage = err.errors[fieldName].message;
            return res.status(400).json({ error: errorMessage, field: fieldName, errorCode: `invalid_${fieldName}_format` });
        } else if (err.name === "CastError") {
            return res.status(400).json({ error: `Invalid type for field ${err.path}` });
        }
        res.status(500).json({ error: err.message });
    }
});

// Delete alert
router.delete("/:id_alert", async (req, res) => {
    const { id_alert } = req.params

    try {

        if(!mongoose.Types.ObjectId.isValid(id_alert)) {
            return res.status(400).json({ error: "Invalid alert ID" });
        }
        
        const deletedAlert = await Alert.findOneAndDelete({_id: id_alert });
        
        if(!deletedAlert) {
            return res.status(404).json({ error: "No such alert" });
        }
        res.status(200).json({
            message: "Alert deleted successfully",
            deletedAlert
        });

    } catch (err) {
        console.error("Error deleting alert: ", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;