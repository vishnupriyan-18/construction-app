const { getProductExpenses, createProductExpense, updateProductExpense, deleteProductExpense } = require('../models/productExpenseModel')
const { getServiceExpenses, createServiceExpense, updateServiceExpense, deleteServiceExpense } = require('../models/serviceExpenseModel')
const { getProjectById } = require('../models/projectModel')

const normalizeProduct = (expense) => ({
  ...expense,
  item_name: expense.product_name,
  quantity: expense.quantity,
  amount: expense.amount,
  expense_date: expense.expense_date,
})

const normalizeService = (expense) => ({
  ...expense,
  item_name: expense.service_name,
  service_type: expense.service_type,
  amount: expense.amount,
  expense_date: expense.expense_date,
})

// Product Expenses
const listProductExpenses = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const expenses = getProductExpenses(req.params.id).map(normalizeProduct)
    res.json({ productExpenses: expenses })
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch product expenses.' })
  }
}

const addProductExpense = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const { item_name, product_name, quantity, rate, amount, expense_date } = req.body
    const name = item_name || product_name
    if (!name || !amount || !expense_date) {
      return res.status(400).json({ message: 'Product name, amount and date are required.' })
    }
    const expense = createProductExpense(req.params.id, { product_name: name, quantity, rate, amount, expense_date })
    res.status(201).json(normalizeProduct(expense))
  } catch (error) {
    res.status(500).json({ message: 'Could not add product expense.' })
  }
}

const editProductExpense = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const { item_name, product_name, quantity, rate, amount, expense_date } = req.body
    const payload = {
      product_name: item_name || product_name,
      quantity,
      rate,
      amount,
      expense_date,
    }
    const updated = updateProductExpense(req.params.expenseId, req.params.id, payload)
    if (!updated) return res.status(404).json({ message: 'Expense not found.' })
    res.json(normalizeProduct(updated))
  } catch (error) {
    res.status(500).json({ message: 'Could not update expense.' })
  }
}

const removeProductExpense = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const deleted = deleteProductExpense(req.params.expenseId, req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Expense not found.' })
    res.json({ message: 'Expense deleted.' })
  } catch (error) {
    res.status(500).json({ message: 'Could not delete expense.' })
  }
}

// Service Expenses
const listServiceExpenses = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const expenses = getServiceExpenses(req.params.id).map(normalizeService)
    res.json({ serviceExpenses: expenses })
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch service expenses.' })
  }
}

const addServiceExpense = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const { item_name, service_name, service_type, amount, expense_date } = req.body
    const name = item_name || service_name
    if (!name || !amount || !expense_date) {
      return res.status(400).json({ message: 'Service name, amount and date are required.' })
    }
    const expense = createServiceExpense(req.params.id, { service_name: name, service_type, amount, expense_date })
    res.status(201).json(normalizeService(expense))
  } catch (error) {
    res.status(500).json({ message: 'Could not add service expense.' })
  }
}

const editServiceExpense = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const { item_name, service_name, service_type, amount, expense_date } = req.body
    const payload = {
      service_name: item_name || service_name,
      service_type,
      amount,
      expense_date,
    }
    const updated = updateServiceExpense(req.params.expenseId, req.params.id, payload)
    if (!updated) return res.status(404).json({ message: 'Expense not found.' })
    res.json(normalizeService(updated))
  } catch (error) {
    res.status(500).json({ message: 'Could not update expense.' })
  }
}

const removeServiceExpense = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const deleted = deleteServiceExpense(req.params.expenseId, req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Expense not found.' })
    res.json({ message: 'Expense deleted.' })
  } catch (error) {
    res.status(500).json({ message: 'Could not delete expense.' })
  }
}

module.exports = {
  listProductExpenses, addProductExpense, editProductExpense, removeProductExpense,
  listServiceExpenses, addServiceExpense, editServiceExpense, removeServiceExpense,
}
