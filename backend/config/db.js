const Database = require('better-sqlite3')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config()

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'construction.db')

const db = new Database(dbPath)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT DEFAULT '',
    start_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS client_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    amount_received REAL NOT NULL DEFAULT 0,
    payment_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity_text TEXT DEFAULT '1',
    amount REAL NOT NULL DEFAULT 0,
    expense_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS service_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    service_name TEXT NOT NULL,
    service_type TEXT DEFAULT '',
    amount REAL NOT NULL DEFAULT 0,
    expense_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );
`)

console.log('SQLite database initialized at:', dbPath)

module.exports = db
