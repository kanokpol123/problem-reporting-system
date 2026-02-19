const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// ===== DB CONNECTION =====
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'problem_reporting'
})

db.connect((error) => {
  if (error) {
    console.error('Database connection failed:', error)
    return
  }
  console.log('Connected to MySQL database')
})

// ===== MIDDLEWARE: ตรวจสอบ Token =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token provided' })

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' })
    req.user = user
    next()
  })
}

// ===== AUTH ROUTES =====

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password)
    return res.status(400).json({ message: 'Please fill all fields' })

  const hashedPassword = await bcrypt.hash(password, 10)
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
  db.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err) return res.status(500).json({ message: 'Email already exists or error', error: err })
    res.status(201).json({ message: 'Register success' })
  })
})

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const sql = 'SELECT * FROM users WHERE email = ?'
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' })

    const user = results[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' })

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    )
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
  })
})

// ===== PROBLEM ROUTES =====

// แจ้งปัญหา
app.post('/api/problems', authenticateToken, (req, res) => {
  const { title, description, category } = req.body
  const userId = req.user.id
  if (!title || !description)
    return res.status(400).json({ message: 'Title and description are required' })

  const sql = 'INSERT INTO problems (title, description, category, status, user_id) VALUES (?, ?, ?, "pending", ?)'
  db.query(sql, [title, description, category, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error creating problem', error: err })
    res.status(201).json({ message: 'Problem reported', id: result.insertId })
  })
})

// ดูรายการปัญหาทั้งหมด
app.get('/api/problems', authenticateToken, (req, res) => {
  const sql = `
    SELECT p.*, u.username 
    FROM problems p 
    JOIN users u ON p.user_id = u.id 
    ORDER BY p.created_at DESC
  `
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching problems', error: err })
    res.json(results)
  })
})

// ดูปัญหาของตัวเอง
app.get('/api/problems/my', authenticateToken, (req, res) => {
  const sql = 'SELECT * FROM problems WHERE user_id = ? ORDER BY created_at DESC'
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching problems', error: err })
    res.json(results)
  })
})

// ดูปัญหา by ID
app.get('/api/problems/:id', authenticateToken, (req, res) => {
  const sql = `
    SELECT p.*, u.username 
    FROM problems p 
    JOIN users u ON p.user_id = u.id 
    WHERE p.id = ?
  `
  db.query(sql, [req.params.id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Problem not found' })
    res.json(results[0])
  })
})

// อัพเดทสถานะปัญหา (admin only)
app.patch('/api/problems/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body
  const allowedStatus = ['pending', 'in_progress', 'resolved', 'closed']
  if (!allowedStatus.includes(status))
    return res.status(400).json({ message: 'Invalid status' })

  const sql = 'UPDATE problems SET status = ? WHERE id = ?'
  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating status', error: err })
    res.json({ message: 'Status updated' })
  })
})

// ===== START SERVER =====
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})