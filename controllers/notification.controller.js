const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const notifications = await Notification.find({ userId, fetch: true }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.readNotification = async (req, res) => {
  try {
    const userId = req.query.userId;
    const notificationId = req.query.notificationId;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { unread: false } },
      { new: true }
    );

    res.status(200).json("success");
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.readAllNotifications = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    await Notification.updateMany(
      { userId, unread: true },
      { $set: { unread: false } }
    );
    res.status(200).json("suceess");
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.dismissNotification = async(req, res) => {
  try {
    const userId = req.query.userId;
    const notificationId = req.query.notificationId;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { fetch: false } },
      { new: true }
    );

    res.status(200).json("success");
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
