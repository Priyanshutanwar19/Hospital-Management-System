const Notification = require("../models/Notification");
const apiResponse = require("../utils/apiResponse");

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id });
    res.json(apiResponse({ success: true, message: "Notifications retrieved", data: notifications }));
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { readStatus: true }, { new: true });
    if (!notification) return res.status(404).json(apiResponse({ success: false, message: "Notification not found" }));
    res.json(apiResponse({ success: true, message: "Notification marked as read", data: notification }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead };
