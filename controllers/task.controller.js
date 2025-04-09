const Task = require("../models/Task");
const Notification = require("../models/Notification");

// Get all tasks for a user with statistics
exports.getTasks = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      pending: tasks.filter((task) => !task.completed).length,
      overdue: tasks.filter((task) => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      }).length,
    };

    res.status(200).json({ tasks, stats });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();

    const notifications = [];

    // Always send "Task Created"
    notifications.push({
      userId: task.userId,
      title: "Task Created",
      text: `Task ${task.title} is `,
      eventType: "Task Created",
    });

    // Check if due date is today
    const dueDate = new Date(task.dueDate);
    const today = new Date();

    // Remove time from today and dueDate to only compare dates
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      notifications.push({
        userId: task.userId,
        title: "Overdue Task",
        text: `Task   "${task.title}" is due today.`,
        eventType: "Overdue Task",
      });
    } else if (dueDate.getTime() === today.getTime()) {
      notifications.push({
        userId: task.userId,
        title: "Task Due Today",
        text: `Task   "${task.title}" is due today.`,
        eventType: "Task Due Soon",
      });
    }

    // Create all notifications
    const createdNotifications = await Notification.insertMany(notifications);

    // Send notification through socket
    const io = req.app.get("io");
    createdNotifications.forEach((notif) => {
      io.emit(`notification:${notif.userId}`, notif);
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      updatedAt: Date.now(),
    };

    const oldTask = await Task.findById(req.params.id);

    const task = await Task.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Determine eventType
    const eventType =
      (oldTask.completed !== req.body.completed && req.body.completed)
        ? "Task Completed"
        : "Task Updated";

    const io = req.app.get("io");

    const notifications = [];

    // Check if due date is today
    const dueDate = new Date(task.dueDate);
    const today = new Date();

    // Remove time from today and dueDate to only compare dates
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (!req.body.completed) {
      if (dueDate.getTime() < today.getTime()) {
        notifications.push({
          userId: task.userId,
          title: "Overdue Task",
          text: `Task   "${task.title}" is due today.`,
          eventType: "Overdue Task",
        });
      } else if (dueDate.getTime() === today.getTime()) {
        notifications.push({
          userId: task.userId,
          title: "Task Due Today",
          text: `Task   "${task.title}" is due today.`,
          eventType: "Task Due Soon",
        });
      }
    }

    notifications.push({
      userId: task.userId,
      title: eventType,
      text: `Task "${task.title}" ${eventType.toLowerCase()}.`,
      eventType,
    });

    // Create all notifications
    const createdNotifications = await Notification.insertMany(notifications);

    // Send notification through socket
    createdNotifications.forEach((notif) => {
      io.emit(`notification:${notif.userId}`, notif);
    });

    res.status(200).json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const io = req.app.get("io");

    // Create notification
    const notification = await Notification.create({
      userId: task.userId,
      title: "Task Deleted",
      text: `Task "${task.title}" has been deleted.`,
      eventType: "Task Deleted",
    });

    io.emit(`notification:${notification.userId}`, notification);

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
