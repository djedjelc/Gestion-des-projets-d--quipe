const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember
} = require('../controllers/projects');

const { protect, authorize } = require('../middlewares/auth');

const taskRouter = require('./tasks');

const router = express.Router();

router.use('/:projectId/tasks', taskRouter);

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('responsable', 'admin'), createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.route('/:id/members')
  .put(addProjectMember);

module.exports = router;