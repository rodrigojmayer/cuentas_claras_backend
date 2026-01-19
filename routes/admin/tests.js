import express from "express";
import requireAdmin from "../../middlewares/requireAdmin.js";

const router = express.Router();

router.get("/", requireAdmin, (req, res) => {
  res.json({ ok: true, admin: req.user.email });
});

export default router;