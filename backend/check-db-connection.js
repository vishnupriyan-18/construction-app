const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
})

pool.getConnection((err, conn) => {
  if (err) {
    console.error('ERR', err.code, err.sqlMessage || err.message)
    process.exit(1)
  }
  console.log('CONNECTED')
  conn.release()
  process.exit(0)
})
