const Joi = require('joi');
const AppError = require('../utils/AppError');

const types = ['booking', 'complaint', 'feedback', 'broadcast', 'update', 'system_alert', 'direct_message', 'marketing'];
const message = Joi.string().trim().min(5).max(500).required();
const type = Joi.string().valid(...types).optional();

function validate(schema, location) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[location], { abortEarly: false });
        if (error) return next(new AppError(error.details.map(detail => detail.message).join(' | '), 400));
        req[location] = value;
        next();
    };
}

exports.validateTargetedNotification = validate(Joi.object({
    userId: Joi.string().uuid().required(), type, message
}), 'body');

exports.validateBroadcast = validate(Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    message, type,
    targetAudience: Joi.string().valid('all', 'users_only', 'vendors_only').optional(),
    packageId: Joi.string().uuid().optional(),
    bookingStatus: Joi.string().valid('pending_payment', 'pending', 'accepted', 'completed', 'rejected', 'cancelled').optional()
}), 'body');

exports.validateNotificationIdParam = validate(Joi.object({ id: Joi.string().uuid().required() }), 'params');
exports.validateNotificationQuery = validate(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
}), 'query');
