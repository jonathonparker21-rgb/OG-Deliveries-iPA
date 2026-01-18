import "dotenv/config";
import bcrypt from "bcryptjs";
import db from "../src/db.js";

const email = process.env.OG_ADMIN_EMAIL || "admin@ogdeliveries.local";
const password = process.env.OG_ADMIN_PASSWORD || "ChangeMe123!";

const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email);
if (existing) {
  console.log("Admin already exists for", email);
  process.exit(0);
}

const passwordHash = bcrypt.hashSync(password, 12);
const now = new Date().toISOString();

db.prepare("INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)").run(email, passwordHash, now);

console.log("Seeded admin user", email);
