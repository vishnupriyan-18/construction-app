const { getPaymentsByProject, createPayment, deletePayment } = require('../models/clientPaymentModel')
const { getProjectById } = require('../models/projectModel')

const listPayments = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const payments = getPaymentsByProject(req.params.id).map((payment) => ({
      ...payment,
      amount: payment.amount_received,
    }))
    res.json(payments)
  } catch (error) {
    console.error('List payments error', error)
    res.status(500).json({ message: 'Could not fetch payments.' })
  }
}

const addPayment = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const { amount_received, payment_date } = req.body
    if (!amount_received || !payment_date) {
      return res.status(400).json({ message: 'Amount and date are required.' })
    }
    const payment = createPayment(req.params.id, amount_received, payment_date)
    res.status(201).json(payment)
  } catch (error) {
    console.error('Add payment error', error)
    res.status(500).json({ message: 'Could not add payment.' })
  }
}

const removePayment = (req, res) => {
  try {
    const project = getProjectById(req.params.id, req.user.id)
    if (!project) return res.status(404).json({ message: 'Project not found.' })
    const deleted = deletePayment(req.params.paymentId, req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Payment not found.' })
    res.json({ message: 'Payment deleted.' })
  } catch (error) {
    console.error('Remove payment error', error)
    res.status(500).json({ message: 'Could not delete payment.' })
  }
}

module.exports = { listPayments, addPayment, removePayment }
