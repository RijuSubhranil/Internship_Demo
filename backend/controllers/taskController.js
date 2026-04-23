import Task from '../models/task.js';


export const createTask = async (req, res) => {
  try {
    const newTask = await Task.create({ ...req.body, user: req.user.id });
    res.status(201).json({ status: 'success', data: newTask });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ status: 'success', results: tasks.length, data: tasks });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};


export const getAllTasksAdmin = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('user', 'name email phoneNumber') 
      .sort('-createdAt');
    res.status(200).json({ status: 'success', results: tasks.length, data: tasks });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'No task found' });

    if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: updatedTask });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};