const express = require('express')
const router = express.Router({ mergeParams: true })
const authMiddleware = require('../middleware/authMiddleware')
const { listPayments, addPayment, removePayment } = require('../controllers/clientPaymentController')

router.use(authMiddleware)
router.get('/', listPayments)
router.post('/', addPayment)
router.delete('/:paymentId', removePayment)

module.exports = router
