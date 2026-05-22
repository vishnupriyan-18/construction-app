const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: 3306,
  allowPublicKeyRetrieval: true,
  ssl: { rejectUnauthorized: false },
}

const conn = mysql.createConnection(options)
conn.connect((err) => {
  if (err) {
    console.error('ERR', err.code, err.sqlMessage || err.message)
    process.exit(1)
  }
  console.log('CONNECTED with auth options')
  conn.end()
})
