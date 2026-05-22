const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: 3306,
  authPlugins: {
    caching_sha2_password: mysql.authPlugins.caching_sha2_password({ overrideIsSecure: true }),
  },
})

conn.connect((err) => {
  if (err) {
    console.error('ERR', err.code, err.sqlMessage || err.message)
    process.exit(1)
  }
  console.log('CONNECTED authPlugins')
  conn.end()
})
