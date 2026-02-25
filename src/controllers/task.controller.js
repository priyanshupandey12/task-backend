const Task=require('../models/task.model')



const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); 
    const skip = (pageNum - 1) * limitNum;


    const query = { user: req.user._id };

    if (status && ["todo", "in-progress", "done"].includes(status)) {
      query.status = status;
    }

    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    const [tasks, total] = await Promise.all([
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Task.countDocuments(query),
    ]);

  
    const decryptedTasks = tasks.map((task) => task.toSafeObject());

    res.status(200).json({
      success: true,
      data: decryptedTasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};


const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }
    res.status(200).json({ success: true, data: task.toSafeObject() });
  } catch (error) {
    next(error);
  }
};


const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};


const updateTask = async (req, res, next) => {
  try {

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    const { title, description, status } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description; 
    if (status !== undefined) task.status = status;

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: task.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};


const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }
    res.status(200).json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    next(error);
  }
};



module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };