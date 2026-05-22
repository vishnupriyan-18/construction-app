const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  listProductExpenses, addProductExpense, editProductExpense, removeProductExpense,
  listServiceExpenses, addServiceExpense, editServiceExpense, removeServiceExpense,
} = require('../controllers/expenseController')

const router = express.Router({ mergeParams: true })
router.use(authMiddleware)

router.get('/products', listProductExpenses)
router.post('/products', addProductExpense)
router.put('/products/:expenseId', editProductExpense)
router.delete('/products/:expenseId', removeProductExpense)

router.get('/services', listServiceExpenses)
router.post('/services', addServiceExpense)
router.put('/services/:expenseId', editServiceExpense)
router.delete('/services/:expenseId', removeServiceExpense)

module.exports = router
