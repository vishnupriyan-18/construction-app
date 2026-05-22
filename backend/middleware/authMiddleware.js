const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'constructionsecret')
    req.user = { id: decoded.id, phone_number: decoded.phone_number }
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' })
  }
}

module.exports = authMiddleware
