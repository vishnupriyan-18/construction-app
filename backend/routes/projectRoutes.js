const express = require('express')
const { listProjects, getProject, addProject, modifyProject, removeProject } = require('../controllers/projectController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()
router.use(authMiddleware)

router.get('/', listProjects)
router.get('/:id', getProject)
router.post('/', addProject)
router.put('/:id', modifyProject)
router.delete('/:id', removeProject)

module.exports = router
