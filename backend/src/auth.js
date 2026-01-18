import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.OG_JWT_SECRET;
  if (!secret) {
    throw new Error("OG_JWT_SECRET is required");
  }
  return secret;
};

export const signToken = (admin) =>
  jwt.sign({ sub: admin.id, email: admin.email }, getJwtSecret(), { expiresIn: "12h" });

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.admin = payload;
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }

  return next();
};
