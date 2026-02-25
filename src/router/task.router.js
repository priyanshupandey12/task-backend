const express = require("express");
const router = express.Router();

const { getTasks, getTask, createTask, updateTask, deleteTask } = require("../controllers/task.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate, createTaskSchema, updateTaskSchema } = require("../utils/validators");


router.use(protect);

router.route("/").get(getTasks).post(validate(createTaskSchema), createTask);

router.route("/:id").get(getTask).patch(validate(updateTaskSchema), updateTask).delete(deleteTask);

module.exports = router;