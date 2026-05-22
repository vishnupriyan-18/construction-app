const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const hosts = ['localhost', '127.0.0.1']

const testHost = async (host) => {
  return new Promise((resolve) => {
    const pool = mysql.createPool({
      host,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: 3306,
    })
    pool.getConnection((err, conn) => {
      if (err) {
        resolve({ host, error: err.message, code: err.code })
      } else {
        conn.release()
        resolve({ host, success: true })
      }
    })
  })
}

;(async () => {
  for (const host of hosts) {
    const result = await testHost(host)
    console.log(result)
  }
  process.exit(0)
})()
