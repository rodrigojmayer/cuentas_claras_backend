const systemAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== process.env.SYSTEM_SECRET_KEY) {
    return res.status(403).json({ error: "Sistema no autorizado" });
  }

  next();
};

export default systemAuth;