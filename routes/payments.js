import express from "express";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Debt from "../models/Debt.js";

const router = express.Router();

// Create a payment
router.post("/", async (req, res) => {
    try {
        const payment = new Payment(req.body);
        await payment.save();
        const debt = await Debt.findOneAndUpdate(
                    { _id: payment.id_debt },
                    { $inc: { amount: -payment.amount } },  //  subtract payment.amount 
                    { new: true, runValidators: true }
                )
        // res.status(201).json(payment);
        res.json({ payment, debt });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all payments
router.get("/", async (req, res) => {
    const payments = await Payment.find({});
    res.json(payments);
})

// Get a single payment by _id
router.get("/:id", async (req, res) => {
    const { id } = req.params
    
    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid payment ID" });
        }

        // Find the payment by ID
        const payment = await Payment.findById(id);

        // Handle not found case
        if(!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        // Success
        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get payments by debt
router.get("/debt/:id_debt", async (req, res) => {
    const { id_debt } = req.params

    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id_debt)) {
            return res.status(400).json({ error: "Invalid debt ID" });
        }

        // Find the payments by debt ID
        const payments = await Payment.find({ id_debt })
            // .populate("id_debt");

        // Check if the array is empty or null
        if(!payments || payments.length === 0) {
            return res.status(404).json({ error: "No payments found for this debt" });
        }

        // Success
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update payment
router.patch("/:id_payment", async (req, res) => {
    const { id_payment } = req.params
    const { id_debt, amount, date_payment, dolar_google, enabled, deleted } = req.body
    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id_payment)) {
            return res.status(400).json({ error: "Invalid payment ID" });
        }
        if (amount && typeof req.body.amount !== "number") {
            return res.status(400).json({ error: "Amount must be a number." });
        }
        const updateData = { id_debt, amount, date_payment, dolar_google, enabled, deleted }
        
        // Find the user by ID
        const payment = await Payment.findOneAndUpdate(
            { "_id": id_payment},
            updateData,
            { new: true, runValidators: true }
        )
        
        if(!payment) {
            return res.status(404).json({ error: "No such payment" });
        }

        res.json(payment);
    
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

// Delete payment
router.delete("/:id_payment", async (req, res) => {
    const { id_payment } = req.params

    try {
        if(!mongoose.Types.ObjectId.isValid(id_payment)) {
            return res.status(400).json({ error: "Invalid payment ID" });
        }

        const deletedPayment = await Payment.findOneAndDelete({_id: id_payment});

        if(!deletedPayment) {
            return res.status(404).json({ error: "No such payment" });
        }
        res.status(200).json({
            message: "Payment deleted successfully",
            deletedPayment
        });
    } catch (err) {
        console.error("Error deleting payment: ", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;