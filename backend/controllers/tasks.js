const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks
// @route   GET /api/tasks
// @route   GET /api/projects/:projectId/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query;

    if (req.params.projectId) {
      // Get tasks for a specific project
      query = Task.find({ project: req.params.projectId });
    } else {
      // If user is not admin, only get tasks assigned to them or created by them
      if (req.user.role !== 'admin') {
        query = Task.find({
          $or: [
            { assignedTo: req.user.id },
            { createdBy: req.user.id }
          ]
        });
      } else {
        query = Task.find();
      }
    }

    // Populate references
    query = query.populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    const tasks = await query;

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate([
      { path: 'project', select: 'name owner members' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Make sure user has access to the task
    // Admin can access any task
    // Task creator can access the task
    // Task assignee can access the task
    // Project owner/member can access the task
    if (
      req.user.role !== 'admin' &&
      task.createdBy._id.toString() !== req.user.id &&
      (task.assignedTo && task.assignedTo._id.toString() !== req.user.id) &&
      task.project.owner.toString() !== req.user.id &&
      !task.project.members.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create task
// @route   POST /api/projects/:projectId/tasks
// @access  Private/Owner-Admin-Responsable
exports.createTask = async (req, res) => {
  try {
    req.body.project = req.params.projectId;
    req.body.createdBy = req.user.id;

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Only project owner, members or admin can create tasks
    if (
      project.owner.toString() !== req.user.id &&
      !project.members.includes(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add tasks to this project'
      });
    }

    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id).populate({
      path: 'project',
      select: 'owner members'
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user can update task (owner, creator, admin)
    if (
      req.user.role !== 'admin' &&
      task.createdBy.toString() !== req.user.id &&
      task.project.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: 'project',
      select: 'owner'
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user can delete task (owner, creator, admin)
    if (
      req.user.role !== 'admin' &&
      task.createdBy.toString() !== req.user.id &&
      task.project.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 