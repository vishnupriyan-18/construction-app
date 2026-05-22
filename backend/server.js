const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const expenseRoutes = require('./routes/expenseRoutes')
const paymentRoutes = require('./routes/paymentRoutes')

dotenv.config()

// Initialize SQLite (schema created on require)
require('./config/db')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Construction ERP Lite API is running' })
})

app.use('/api', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects/:id/expenses', expenseRoutes)
app.use('/api/projects/:id/payments', paymentRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
