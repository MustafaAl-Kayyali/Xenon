const Joi = require('joi');
const AppError = require('../utils/AppError');

const handleJoiError = (error, next) => {
    if (error) {
        const errorMessage = error.details.map(err => err.message).join(' | ');
        return next(new AppError(errorMessage, 400));
    }
};

const targetedNotificationSchema = Joi.object({
    userIds: Joi.alternatives().try(
        Joi.string().uuid(),
        Joi.array().items(Joi.string().uuid()).min(1)
    ).required().messages({
        'any.required': 'You must provide at least one user ID.'
    }),
    title: Joi.string().trim().min(3).max(100).required(),
    message: Joi.string().trim().min(5).max(500).required(),
    type: Joi.string().optional()
});

const broadcastSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    message: Joi.string().trim().min(5).max(500).required(),
    type: Joi.string().optional(),
    targetAudience: Joi.string().valid('all', 'users_only', 'vendors_only').optional(),
    packageId: Joi.string().uuid().optional(),
    bookingStatus: Joi.string().optional()
});

const mongoIdParamSchema = Joi.object({
    id: Joi.string().uuid().required().messages({
        'string.guid': 'Invalid ID format. Must be a valid UUIDv7.'
    })
});

exports.validateTargetedNotification = (req, res, next) => {
    const { error, value } = targetedNotificationSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return handleJoiError(error, next);
    req.body = value;
    next();
};

exports.validateBroadcast = (req, res, next) => {
    const { error, value } = broadcastSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return handleJoiError(error, next);
    req.body = value;
    next();
};

exports.validateNotificationIdParam = (req, res, next) => {
    const { error, value } = mongoIdParamSchema.validate(req.params, { abortEarly: false, stripUnknown: true });
    if (error) return handleJoiError(error, next);
    req.params = value;
    next();
};