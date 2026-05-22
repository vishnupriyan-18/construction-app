const db = require('../config/db')

const getExpensesByProject = (projectId) => {
  return db.prepare('SELECT * FROM expenses WHERE project_id = ? ORDER BY expense_date DESC, created_at DESC').all(projectId)
}

const getExpenseById = (expenseId, projectId) => {
  return db.prepare('SELECT * FROM expenses WHERE id = ? AND project_id = ?').get(expenseId, projectId) || null
}

const createExpense = (projectId, expense) => {
  const { category, item_name, service_type, quantity, amount, expense_date } = expense
  const result = db.prepare(
    `INSERT INTO expenses (project_id, category, item_name, service_type, quantity, amount, expense_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(projectId, category, item_name, service_type || '', quantity || 0, amount, expense_date)
  return getExpenseById(result.lastInsertRowid, projectId)
}

const deleteExpense = (expenseId, projectId) => {
  const result = db.prepare('DELETE FROM expenses WHERE id = ? AND project_id = ?').run(expenseId, projectId)
  return result.changes > 0
}

module.exports = { getExpensesByProject, getExpenseById, createExpense, deleteExpense }
