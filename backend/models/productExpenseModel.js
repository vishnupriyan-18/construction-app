
const db = require('../config/db')

const getProductExpenses = (projectId) =>
  db.prepare(
    'SELECT * FROM product_expenses WHERE project_id = ? ORDER BY expense_date DESC, created_at DESC'
  ).all(projectId)

const getTotalProductExpenses = (projectId) => {
  const row = db
    .prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM product_expenses WHERE project_id = ?'
    )
    .get(projectId)

  return row ? row.total : 0
}

const createProductExpense = (projectId, data) => {
  const { product_name, quantity_text, amount, expense_date } = data

  const result = db.prepare(
    'INSERT INTO product_expenses (project_id, product_name, quantity_text, amount, expense_date) VALUES (?, ?, ?, ?, ?)'
  ).run(
    projectId,
    product_name,
    quantity_text || '1',
    amount,
    expense_date
  )

  return db
    .prepare('SELECT * FROM product_expenses WHERE id = ?')
    .get(result.lastInsertRowid)
}

const updateProductExpense = (id, projectId, data) => {
  const { product_name, quantity_text, amount, expense_date } = data

  db.prepare(
    'UPDATE product_expenses SET product_name=?, quantity_text=?, amount=?, expense_date=? WHERE id=? AND project_id=?'
  ).run(
    product_name,
    quantity_text || '1',
    amount,
    expense_date,
    id,
    projectId
  )

  return db.prepare('SELECT * FROM product_expenses WHERE id = ?').get(id)
}

const deleteProductExpense = (id, projectId) => {
  const result = db
    .prepare(
      'DELETE FROM product_expenses WHERE id = ? AND project_id = ?'
    )
    .run(id, projectId)

  return result.changes > 0
}

module.exports = {
  getProductExpenses,
  getTotalProductExpenses,
  createProductExpense,
  updateProductExpense,
  deleteProductExpense,
}
