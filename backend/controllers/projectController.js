const { getProjectsByUser, getProjectById, createProject, updateProject, deleteProject } = require('../models/projectModel')
const { getTotalReceived } = require('../models/clientPaymentModel')
const { getTotalProductExpenses } = require('../models/productExpenseModel')
const { getTotalServiceExpenses } = require('../models/serviceExpenseModel')

const listProjects = (req, res) => {
  try {
    const filters = { search: req.query.search }
    const projects = getProjectsByUser(req.user.id, filters)
    const summary = {
      totalReceived: projects.reduce((s, p) => s + p.total_received, 0),
      totalExpenseAmount: projects.reduce((s, p) => s + p.total_expenses, 0),
      remainingBalance: projects.reduce((s, p) => s + p.balance, 0),
      activeProjectsCount: projects.length,
    }
    res.json({ projects, summary })
  } catch (error) {
    console.error('List projects error', error)
    res.status(500).json({ message: 'Could not fetch projects.' })
  }
}

const getProject = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    res.json(project)
  } catch (error) {
    console.error('Get project error', error)
    res.status(500).json({ message: 'Could not fetch project details.' })
  }
}

const addProject = (req, res) => {
  try {
    const { project_name, client_name, client_phone, start_date } = req.body
    if (!project_name || !client_name || !start_date) {
      return res.status(400).json({ message: 'Please complete all required fields.' })
    }
    const project = createProject({ project_name, client_name, client_phone, start_date }, req.user.id)
    res.status(201).json(project)
  } catch (error) {
    console.error('Add project error', error)
    res.status(500).json({ message: 'Could not create project.' })
  }
}

const modifyProject = (req, res) => {
  try {
    const { project_name, client_name, client_phone, start_date } = req.body
    if (!project_name || !client_name || !start_date) {
      return res.status(400).json({ message: 'Please complete all required fields.' })
    }
    const updated = updateProject(req.params.id, { project_name, client_name, client_phone, start_date }, req.user.id)
    if (!updated) return res.status(404).json({ message: 'Project not found.' })
    res.json(updated)
  } catch (error) {
    console.error('Modify project error', error)
    res.status(500).json({ message: 'Could not update project.' })
  }
}

const removeProject = (req, res) => {
  try {
    const deleted = deleteProject(req.params.id, req.user.id)
    if (!deleted) return res.status(404).json({ message: 'Project not found.' })
    res.json({ message: 'Project deleted successfully.' })
  } catch (error) {
    console.error('Remove project error', error)
    res.status(500).json({ message: 'Could not delete project.' })
  }
}

module.exports = { listProjects, getProject, addProject, modifyProject, removeProject }
