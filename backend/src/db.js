import Database from "better-sqlite3";

const db = new Database(process.env.OG_DB_PATH || "./data/og-deliveries.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pricing (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    base_rate_cents INTEGER NOT NULL,
    per_mile_cents INTEGER NOT NULL,
    minimum_fee_cents INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    credits_cents INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    payload TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(admin_id) REFERENCES admins(id)
  );
`);

const ensurePricing = () => {
  const row = db.prepare("SELECT id FROM pricing WHERE id = 1").get();
  if (!row) {
    db.prepare(
      "INSERT INTO pricing (id, base_rate_cents, per_mile_cents, minimum_fee_cents, updated_at) VALUES (1, ?, ?, ?, ?)"
    ).run(800, 250, 1200, new Date().toISOString());
  }
};

ensurePricing();

export default db;
