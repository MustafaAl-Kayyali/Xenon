const notificationCore = require("../services/Core/notificationCore");
const AppError = require("../utils/AppError");
const Booking = require("../Models/BookingModel");

exports.sendUpdateToClient = async (req, res, next) => {
    try {
        const { userId, type, message } = req.body;
        const vendorId = req.user._id;

        if (req.user.role !== "vendor") {
            return next(new AppError("Only vendors can send updates to clients.", 403));
        }

        if (!await Booking.exists({ vendor_id: vendorId, user_id: userId })) {
            return next(new AppError("You can only notify customers with bookings at your company.", 403));
        }

        const result = await notificationCore.vendorSendUpdateCore(vendorId, userId, type, message);
        return res.status(201).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};

exports.sendNotification = async (req, res, next) => {
    return exports.sendBroadcastNotification(req, res, next);
};

exports.sendBroadcastNotification = async (req, res, next) => {
    try {
        const result = await notificationCore.sendNotificationBroadcastCore(req.user._id, req.user.role, req.body);
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getMyNotifications = async (req, res, next) => {
    try {
        const result = await notificationCore.getMyNotificationsCore(req.user, req.query.page, req.query.limit);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getSentNotifications = async (req, res, next) => {
    try {
        const result = await notificationCore.getSentNotificationsCore(req.user, req.query.page, req.query.limit);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const result = await notificationCore.markAsReadCore(req.user, req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        const result = await notificationCore.markAllAsReadCore(req.user);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.deleteNotification = async (req, res, next) => {
    try {
        const result = await notificationCore.deleteNotificationCore(req.user, req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.deleteAllNotifications = async (req, res, next) => {
    try {
        const result = await notificationCore.deleteAllNotificationsCore(req.user);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
