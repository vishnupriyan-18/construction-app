const db = require('../config/db')
const { getTotalReceived } = require('./clientPaymentModel')
const { getTotalProductExpenses } = require('./productExpenseModel')
const { getTotalServiceExpenses } = require('./serviceExpenseModel')

const enrichProject = (project) => {
  if (!project) return null
  const total_received = getTotalReceived(project.id)
  const total_expenses = getTotalProductExpenses(project.id) + getTotalServiceExpenses(project.id)
  return { ...project, total_received, total_expenses, balance: total_received - total_expenses }
}

const getProjectsByUser = (userId, filters = {}) => {
  let query = 'SELECT * FROM projects WHERE user_id = ?'
  const params = [userId]
  if (filters.search) {
    query += ' AND (project_name LIKE ? OR client_name LIKE ?)'
    const s = `%${filters.search}%`
    params.push(s, s)
  }
  query += ' ORDER BY created_at DESC'
  return db.prepare(query).all(...params).map(enrichProject)
}

const getProjectById = (projectId, userId) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId)
  return enrichProject(row)
}

const createProject = (project, userId) => {
  const { project_name, client_name, client_phone, start_date } = project
  const result = db.prepare(
    `INSERT INTO projects (user_id, project_name, client_name, client_phone, start_date)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(userId, project_name, client_name, client_phone || '', start_date)
  return getProjectById(result.lastInsertRowid, userId)
}

const updateProject = (projectId, project, userId) => {
  const { project_name, client_name, client_phone, start_date } = project
  const result = db.prepare(
    `UPDATE projects SET project_name=?, client_name=?, client_phone=?, start_date=? WHERE id=? AND user_id=?`,
  ).run(project_name, client_name, client_phone || '', start_date, projectId, userId)
  if (result.changes === 0) return null
  return getProjectById(projectId, userId)
}

const deleteProject = (projectId, userId) => {
  const result = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(projectId, userId)
  return result.changes > 0
}

module.exports = { getProjectsByUser, getProjectById, createProject, updateProject, deleteProject, enrichProject }
