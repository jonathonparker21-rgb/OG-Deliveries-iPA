import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import db from "./db.js";
import { signToken, requireAuth } from "./auth.js";
import { creditSchema, customerSchema, loginSchema, pricingSchema } from "./validation.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/auth/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(parsed.data.email);
  if (!admin) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const matches = bcrypt.compareSync(parsed.data.password, admin.password_hash);
  if (!matches) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json({ token: signToken(admin) });
});

app.get("/pricing", requireAuth, (req, res) => {
  const pricing = db.prepare("SELECT base_rate_cents, per_mile_cents, minimum_fee_cents, updated_at FROM pricing WHERE id = 1").get();
  res.json(pricing);
});

app.put("/pricing", requireAuth, (req, res) => {
  const parsed = pricingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  db.prepare(
    "UPDATE pricing SET base_rate_cents = ?, per_mile_cents = ?, minimum_fee_cents = ?, updated_at = ? WHERE id = 1"
  ).run(
    parsed.data.base_rate_cents,
    parsed.data.per_mile_cents,
    parsed.data.minimum_fee_cents,
    new Date().toISOString()
  );

  db.prepare("INSERT INTO activity_log (admin_id, action, payload, created_at) VALUES (?, ?, ?, ?)").run(
    req.admin.sub,
    "pricing.update",
    JSON.stringify(parsed.data),
    new Date().toISOString()
  );

  const updated = db.prepare("SELECT base_rate_cents, per_mile_cents, minimum_fee_cents, updated_at FROM pricing WHERE id = 1").get();
  return res.json(updated);
});

app.get("/customers", requireAuth, (req, res) => {
  const customers = db
    .prepare("SELECT id, name, email, phone, credits_cents, created_at FROM customers ORDER BY created_at DESC")
    .all();
  res.json(customers);
});

app.post("/customers", requireAuth, (req, res) => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const now = new Date().toISOString();
  const result = db
    .prepare("INSERT INTO customers (name, email, phone, credits_cents, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(parsed.data.name, parsed.data.email || null, parsed.data.phone || null, 0, now);

  db.prepare("INSERT INTO activity_log (admin_id, action, payload, created_at) VALUES (?, ?, ?, ?)").run(
    req.admin.sub,
    "customers.create",
    JSON.stringify({ id: result.lastInsertRowid, ...parsed.data }),
    now
  );

  const customer = db
    .prepare("SELECT id, name, email, phone, credits_cents, created_at FROM customers WHERE id = ?")
    .get(result.lastInsertRowid);

  return res.status(201).json(customer);
});

app.post("/credits", requireAuth, (req, res) => {
  const parsed = creditSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const customer = db
    .prepare("SELECT id, credits_cents FROM customers WHERE id = ?")
    .get(parsed.data.customer_id);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const updatedCredits = customer.credits_cents + parsed.data.delta_cents;
  db.prepare("UPDATE customers SET credits_cents = ? WHERE id = ?").run(updatedCredits, parsed.data.customer_id);

  db.prepare("INSERT INTO activity_log (admin_id, action, payload, created_at) VALUES (?, ?, ?, ?)").run(
    req.admin.sub,
    "customers.credit",
    JSON.stringify({ ...parsed.data, new_balance_cents: updatedCredits }),
    new Date().toISOString()
  );

  const updated = db
    .prepare("SELECT id, name, email, phone, credits_cents, created_at FROM customers WHERE id = ?")
    .get(parsed.data.customer_id);

  return res.json(updated);
});

app.get("/activity", requireAuth, (req, res) => {
  const logs = db
    .prepare(
      "SELECT activity_log.id, admins.email AS admin_email, activity_log.action, activity_log.payload, activity_log.created_at FROM activity_log JOIN admins ON admins.id = activity_log.admin_id ORDER BY activity_log.created_at DESC"
    )
    .all();
  res.json(logs);
});

app.listen(port, () => {
  console.log(`OG Deliveries backend listening on port ${port}`);
});
