const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const baseConfig = {
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'construction_erp_lite',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
}

const hosts = [process.env.DB_HOST || 'localhost', '127.0.0.1']

const tryHost = (host) => {
  return new Promise((resolve) => {
    const cfg = Object.assign({ host }, baseConfig)
    const pool = mysql.createPool(cfg)
    pool.getConnection((err, conn) => {
      if (err) return resolve({ host, ok: false, code: err.code, message: err.message })
      conn.release()
      resolve({ host, ok: true })
    })
  })
}

(async () => {
  console.log('Testing DB connection using hosts:', hosts)
  for (const h of hosts) {
    const r = await tryHost(h)
    if (r.ok) console.log(`Success connecting to ${h}`)
    else console.error(`Failed ${h}:`, r.code, r.message)
  }
  process.exit(0)
})()
