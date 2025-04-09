const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, taskController.getTasks);
router.post("/", authMiddleware, taskController.createTask);
router.put("/:id", authMiddleware, taskController.updateTask);
router.delete("/:id", authMiddleware, taskController.deleteTask);

module.exports = router;
