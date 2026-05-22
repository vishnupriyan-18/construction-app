const fs = require('fs').promises
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (e) {
    // ignore
  }
}

async function readFile(name) {
  await ensureDataDir()
  const file = path.join(dataDir, name)
  try {
    const txt = await fs.readFile(file, 'utf8')
    return JSON.parse(txt || '[]')
  } catch (e) {
    return []
  }
}

async function writeFile(name, data) {
  await ensureDataDir()
  const file = path.join(dataDir, name)
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8')
}

module.exports = { readFile, writeFile }
