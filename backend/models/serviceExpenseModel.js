const db = require('../config/db')

const getServiceExpenses = (projectId) =>
  db.prepare('SELECT * FROM service_expenses WHERE project_id = ? ORDER BY expense_date DESC, created_at DESC').all(projectId)

const getTotalServiceExpenses = (projectId) => {
  const row = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM service_expenses WHERE project_id = ?').get(projectId)
  return row ? row.total : 0
}

const createServiceExpense = (projectId, data) => {
  const { service_name, service_type, amount, expense_date } = data
  const result = db.prepare(
    'INSERT INTO service_expenses (project_id, service_name, service_type, amount, expense_date) VALUES (?, ?, ?, ?, ?)',
  ).run(projectId, service_name, service_type || '', amount, expense_date)
  return db.prepare('SELECT * FROM service_expenses WHERE id = ?').get(result.lastInsertRowid)
}

const updateServiceExpense = (id, projectId, data) => {
  const { service_name, service_type, amount, expense_date } = data
  db.prepare(
    'UPDATE service_expenses SET service_name=?, service_type=?, amount=?, expense_date=? WHERE id=? AND project_id=?',
  ).run(service_name, service_type || '', amount, expense_date, id, projectId)
  return db.prepare('SELECT * FROM service_expenses WHERE id = ?').get(id)
}

const deleteServiceExpense = (id, projectId) => {
  const result = db.prepare('DELETE FROM service_expenses WHERE id = ? AND project_id = ?').run(id, projectId)
  return result.changes > 0
}

module.exports = { getServiceExpenses, getTotalServiceExpenses, createServiceExpense, updateServiceExpense, deleteServiceExpense }
