import express from "express";
import mongoose from "mongoose";
import Debt from "../models/Debt.js";
import Payment from "../models/Payment.js";
import Alert from "../models/Alert.js";
import User from "../models/User.js";

const router = express.Router();

// Create a debt
router.post("/", async (req, res) => {
    const { date_due } = req.body;
    req.body.alert_enabled = date_due ? true : false;
    const now = new Date();
    req.body.alerted = new Date(date_due) <= now ? true : false;
    try {
        const debt = new Debt(req.body);
        await debt.save();
        res.status(201).json(debt);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all debts
router.get("/", async (req, res) => {
    const debts = await Debt.find().populate("id_user_creditor id_user_debtor");
    res.json(debts);
});

// Get a single debt by _id
router.get("/:id", async (req,res) => {
    const { id } = req.params

    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid debt ID" });
        }

        // Find the debt by ID
        const debt = await Debt.findById(id);

        // Handle not found case
        if (!debt) {
            return res.status(404).json({ error: "Debt not found" });
        }

        // Success
        res.json(debt);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get the debts by user creditor
router.get("/creditor/:id_user_creditor", async (req, res) => {
    const { id_user_creditor } = req.params

    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id_user_creditor)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Find the debts by user ID
        const debts = await Debt.find({ id_user_creditor })
            .populate("id_user_creditor id_user_debtor") // optional but useful
            .populate({
                path: "payments",
                model: "Payment",
            })
            .populate({
                path: "alerts",
                model: "Alert",
            });
        
        debts.forEach(debt => {
            debt.payments = debt.payments.filter(p => !p.deleted);
            debt.alerts = debt.alerts.filter(a => !a.deleted);
        });

        // // Important: check if the array is empty, not null
        // if(!debts || debts.length === 0) {
        //     return res.status(200).json([]);
        //     return res.status(404).json({ error: "No debts found for this creditor" });
        // }
        // console.log("debts: ", debts)
        // Success
        res.json(debts);
    } catch (err) {
        console.error("catch res: ", res);
        res.status(500).json({ error: err.message });
    }
});

// Get the debts by user debtor
router.get("/debtor/:id_user_debtor", async (req, res) => {
    const { id_user_debtor } = req.params

    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id_user_debtor)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Find the debts by user ID
        const debts = await Debt.find({ id_user_debtor })
            .populate("id_user_creditor id_user_debtor")
            // populate the payments for each debt
            .populate({
                path: "payments",                       // this must match the virtual field name (see below)
                model: "Payment",                       // the model to populate from
                // match: { deleted: false },              // optional filter
                // options: { sort: { date_payment: -1 } } // optional sorting
            })
            .populate({
                path: "alerts",
                model: "Alert",
            });
        
        debts.forEach(debt => {
            debt.payments = debt.payments.filter(p => !p.deleted);
            debt.alerts = debt.alerts.filter(a => !a.deleted);
        });

        // // Important: check if the array is empty, not null
        // if(!debts || debts.length === 0) {
        //     return res.status(404).json({ error: "No debts found for this debtor"});
        // }

        // Success
        res.json(debts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update debt
router.patch("/:id_debt", async (req, res) => {
    const { id_debt } = req.params
    const { id_user_creditor, id_user_debtor, date_debt, detail, initial_amount, amount, dolar_google, status, date_due, alert_enabled, alerted, currency, enabled, deleted } = req.body

    try {
        // Validate the ID first
        if(!mongoose.Types.ObjectId.isValid(id_debt)) {
            return res.status(400).json({ error: "Invalid debt ID" });
        }
        const updateData = { id_user_creditor, id_user_debtor, date_debt, detail, initial_amount, amount, dolar_google, status, date_due, alert_enabled, alerted, currency, enabled, deleted }
        updateData.alert_enabled = date_due ? true : false;
        const now = new Date();
        updateData.alerted = new Date(date_due) <= now ? true : false;
        // Find the debt by ID
        const debt = await Debt.findOneAndUpdate(
            { _id: id_debt },
            updateData, 
            { new: true, runValidators: true }
        )

        if(!debt) {
            return res.status(404).json({ error: "No such debt" });
        }

        res.json(debt);

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

// Delete debt
router.delete("/:id_debt", async (req, res) => {
    const { id_debt } = req.params

    try {
        if(!mongoose.Types.ObjectId.isValid(id_debt)) {
            return res.status(400).json({ error: "Invalid debt ID" });
        }
    
        // Check if debt is involved in any payment
        const isAssignedToPayment = await Payment.exists({ id_debt });
        if(isAssignedToPayment){
            return res.status(400).json({
                error: "Debt cannot be deleted - assigned to one or more payments",
                message: `At least is assigned to the payment ${isAssignedToPayment._id}`
            })
        };
        // Check if debt is involved in any alert
        const isAssignedToAlert = await Alert.exists({ id_debt });
        if(isAssignedToAlert) {
            return res.status(400).json({
                error: "Debt cannot be deleted - assigned to one or more alerts",
                message: `At least is assigned to the alert ${isAssignedToAlert._id}`
            })
        };
        
        const deletedDebt = await Debt.findOneAndDelete({ _id: id_debt });
        if(!deletedDebt) {
            return res.status(404).json({ error: "No such debt" });
        }
        res.status(200).json({
            message: "Debt deleted successfully",
            deletedDebt
        });

    } catch (err) {
        console.error("Error deleting debt: ", err);
        res.status(500).json({ error: err.message });
    }
});

// create debt by debtor email
router.post("/create-by-debtor-email", async (req, res) => {
    let { id_user_creditor, id_user_debtor, email_debtor, detail, amount, currency, date_due } = req.body
    try {
        // Find the debtor
        if(!id_user_debtor){
            let debtorUser = null;
            debtorUser = await User.findOne({ email: email_debtor });
            if (!debtorUser) {
                debtorUser = await User.create({ email: email_debtor })
            }
            id_user_debtor = debtorUser._id
        }
        const now = new Date();
        const bodyDebt = {
            id_user_creditor: id_user_creditor,
            id_user_debtor: id_user_debtor,
            detail: detail,
            initial_amount: amount,
            amount: amount,
            date_due: date_due,
            alert_enabled: date_due ? true : false,
            alerted: new Date(date_due) <= now ? true : false,
            currency: currency,
        }
        const debt = new Debt(bodyDebt);
        await debt.save();
        res.status(201).json(debt)
    } catch (err) {
        console.error("🔥 ERROR:", err);
        res.status(400).json({ error: err.message });
    }
});

export default router;