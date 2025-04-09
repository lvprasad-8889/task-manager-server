const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // connects this notification to a User
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    unread: {
      type: Boolean,
      default: true,
    },
    eventType: {
      type: String,
      enum: [
        "Task Created",
        "Task Updated",
        "Task Deleted",
        "Task Completed",
        "Task Due Soon",
        "Overdue Task",
      ],
      required: true,
    },
    fetch: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Notification", notificationSchema);
