const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { findUserByPhone, createUser } = require('../models/userModel')

const generateToken = (user) => {
  return jwt.sign({ id: user.id, phone_number: user.phone_number }, process.env.JWT_SECRET || 'constructionsecret', {
    expiresIn: '7d',
  })
}

const register = async (req, res) => {
  try {
    const { full_name, phone_number, password } = req.body

    if (!full_name || !phone_number || !password) {
      return res.status(400).json({ message: 'Full name, phone number and password are required.' })
    }

    const existingUser = findUserByPhone(phone_number)
    if (existingUser) {
      return res.status(409).json({ message: 'Phone number is already registered.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = createUser(full_name, phone_number, hashedPassword)
    const token = generateToken(user)

    res.status(201).json({ user: { id: user.id, full_name: user.full_name, phone_number: user.phone_number }, token })
  } catch (error) {
    console.error('Register error', error)
    res.status(500).json({ message: 'Registration failed. Please try again.' })
  }
}

const login = async (req, res) => {
  try {
    const { phone_number, password } = req.body
    if (!phone_number || !password) {
      return res.status(400).json({ message: 'Phone number and password are required.' })
    }

    const user = findUserByPhone(phone_number)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const token = generateToken(user)
    res.json({ user: { id: user.id, full_name: user.full_name, phone_number: user.phone_number }, token })
  } catch (error) {
    console.error('Login error', error)
    res.status(500).json({ message: 'Login failed. Please try again.' })
  }
}

module.exports = { register, login }
