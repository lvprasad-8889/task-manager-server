const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, notificationController.getNotifications);
router.put("/one", authMiddleware, notificationController.readNotification);
router.put("/all", authMiddleware, notificationController.readAllNotifications);
router.put(
  "/dismiss",
  authMiddleware,
  notificationController.dismissNotification
);

module.exports = router;
