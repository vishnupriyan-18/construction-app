const db = require('../config/db')

const getPaymentsByProject = (projectId) =>
  db.prepare('SELECT * FROM client_payments WHERE project_id = ? ORDER BY payment_date DESC, created_at DESC').all(projectId)

const getTotalReceived = (projectId) => {
  const row = db.prepare('SELECT COALESCE(SUM(amount_received), 0) as total FROM client_payments WHERE project_id = ?').get(projectId)
  return row ? row.total : 0
}

const createPayment = (projectId, amount_received, payment_date) => {
  const result = db.prepare(
    'INSERT INTO client_payments (project_id, amount_received, payment_date) VALUES (?, ?, ?)',
  ).run(projectId, amount_received, payment_date)
  return db.prepare('SELECT * FROM client_payments WHERE id = ?').get(result.lastInsertRowid)
}

const deletePayment = (paymentId, projectId) => {
  const result = db.prepare('DELETE FROM client_payments WHERE id = ? AND project_id = ?').run(paymentId, projectId)
  return result.changes > 0
}

module.exports = { getPaymentsByProject, getTotalReceived, createPayment, deletePayment }
