const db = require('../config/db')

const findUserByPhone = (phone_number) => {
  return db.prepare('SELECT id, full_name, phone_number, password FROM users WHERE phone_number = ?').get(phone_number)
}

const createUser = (full_name, phone_number, password) => {
  const existing = findUserByPhone(phone_number)
  if (existing) throw new Error('Phone number already registered')
  const result = db.prepare('INSERT INTO users (full_name, phone_number, password) VALUES (?, ?, ?)').run(full_name, phone_number, password)
  return { id: result.lastInsertRowid, full_name, phone_number }
}

module.exports = { findUserByPhone, createUser }
