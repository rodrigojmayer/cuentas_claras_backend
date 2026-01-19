const requireAdmin = (req, res, next) => {
  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: "Acceso solo admin" });
  }
  next();
};

export default requireAdmin;