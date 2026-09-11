# Xenon Try Fix — Backend Changes Report

## Scope and verification basis

This report covers the backend changes currently present in:

`C:\Users\DELL\Desktop\xenon try fix\Xenon\backend`

The report was verified against the current Git working-tree diff, not reconstructed only from conversation history. At the time of verification, Git reported six modified tracked backend files:

1. `src/Routes/notificationRoutes.js`
2. `src/config/cloudinaryConfig.js`
3. `src/config/firebaseConfig.js`
4. `src/controllers/notificationController.js`
5. `src/services/Core/notificationCore.js`
6. `src/validations/NotificationsValidation.js`

The tracked backend diff contains **107 insertions and 117 deletions**. Two isolated test files were also created under `backend/tests`, but the existing `backend/.gitignore` rule `/tests` currently prevents them from appearing in a normal Git commit.

Line numbers below refer to the current edited files and may move if the files are edited later.

---

## 1. Notification routes

**File:** `backend/src/Routes/notificationRoutes.js`  
**Changed current lines:** 4, 12, 16, 20, 22, 29, and 31

### Added validation import — line 4

```js
const validation = require('../validations/NotificationsValidation');
```

This connects the Joi validation methods to the Express routes. Before this change, the validation module existed but these notification routes did not execute it.

### Direct vendor update route — line 12

```js
router.post(
    "/send-update",
    authMiddleware.restrictTo('vendor'),
    validation.validateTargetedNotification,
    notificationController.sendUpdateToClient
);
```

The actual file keeps this statement on one line; it is expanded above only for readability.

This route now performs three steps in order:

1. `router.use(authMiddleware.protect)` ensures a valid authenticated user exists.
2. `restrictTo('vendor')` ensures only a vendor can use the endpoint.
3. `validateTargetedNotification` validates `userId`, `type`, and `message` before calling the controller.

Previously, the route called the controller directly. That meant invalid request data reached business logic and route-level vendor authorization was absent.

### Broadcast route — line 16

```js
router.post(
    "/broadcast",
    authMiddleware.restrictTo('admin', 'vendor'),
    validation.validateBroadcast,
    notificationController.sendBroadcastNotification
);
```

This allows only an authenticated admin or vendor to broadcast. The submitted title, message, type, audience, package filter, and booking-status filter are validated before use.

### Pagination and identifier validation — lines 20, 22, 29, and 31

```js
router.get("/", validation.validateNotificationQuery, notificationController.getMyNotifications);

router.get(
    "/sent",
    authMiddleware.restrictTo("admin", "vendor"),
    validation.validateNotificationQuery,
    notificationController.getSentNotifications
);

router.patch(
    "/:id/read",
    validation.validateNotificationIdParam,
    notificationController.markAsRead
);

router.patch(
    "/:id",
    validation.validateNotificationIdParam,
    notificationController.deleteNotification
);
```

These additions reject negative pages, excessive page sizes, and malformed notification UUIDs at the route boundary.

---

## 2. Notification controller

**File:** `backend/src/controllers/notificationController.js`  
**Changed current lines:** 3, 14–16, 25–35

### Booking model import — line 3

```js
const Booking = require("../Models/BookingModel");
```

The controller needs this model to verify the relationship between a vendor and the requested recipient.

### Vendor-to-customer authorization — lines 14–16

```js
if (!await Booking.exists({ vendor_id: vendorId, user_id: userId })) {
    return next(new AppError(
        "You can only notify customers with bookings at your company.",
        403
    ));
}
```

The real source uses a single-line `AppError` call. This expanded excerpt is equivalent.

The method affected is:

```js
exports.sendUpdateToClient = async (req, res, next) => { ... }
```

The authenticated vendor ID comes from `req.user._id`. The recipient ID comes from the validated request body. `Booking.exists()` proves that this user has a booking belonging to this vendor.

Why this matters: being a vendor alone should not allow someone to send direct notifications to every platform user. If no matching booking exists, the endpoint returns HTTP 403.

### Removed broken duplicate broadcast logic — lines 25–27

```js
exports.sendNotification = async (req, res, next) => {
    return exports.sendBroadcastNotification(req, res, next);
};
```

The previous `sendNotification` method extracted `vendorId` from the request and called the core with an incompatible argument structure. It now delegates to the single corrected broadcast handler, avoiding two implementations that could behave differently.

### Correct broadcast call — lines 29–35

```js
exports.sendBroadcastNotification = async (req, res, next) => {
    try {
        const result = await notificationCore.sendNotificationBroadcastCore(
            req.user._id,
            req.user.role,
            req.body
        );
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};
```

Previously, the controller extracted `userIds`, `vendorId`, `type`, and `message` from client input and passed them as positional arguments that did not match the repaired core method.

The new call deliberately uses:

- `req.user._id` as the trusted sender identity;
- `req.user.role` as the trusted sender role;
- `req.body` only as notification content and filtering input.

The browser is therefore not allowed to impersonate a different vendor or admin by submitting a forged sender ID.

---

## 3. Notification core service

**File:** `backend/src/services/Core/notificationCore.js`

This file contains the main notification business logic.

### Recipient identity helper — lines 10–15

```js
function recipientId(user) {
    const id = user.role === 'vendor' ? user.owner_user_id : user._id;
    if (!id) {
        throw new AppError('Notification recipient identity is unavailable.', 403);
    }
    return id;
}
```

Vendor authentication records and notification recipients do not always use the same identifier. Notifications belong to the underlying user account, so a vendor inbox uses `owner_user_id`; other roles use their own `_id`.

Without this conversion, a vendor could authenticate correctly but see an empty inbox because the query used the vendor record ID instead of the recipient user ID.

### Common visibility filter — lines 17–19

```js
function visibleNotifications(filter) {
    return {
        ...filter,
        isDeleted: { $ne: true },
        createdAt: {
            $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        }
    };
}
```

This helper consistently excludes soft-deleted records and limits normal inbox/sent operations to notifications created during the last 60 days.

### Direct notification method — lines 24–79

Method:

```js
exports.vendorSendUpdateCore = async function (
    vendorId,
    userId,
    type,
    message,
    session = null
) { ... };
```

Important repaired database fields at lines 40–47:

```js
const newNotification = await Notification.create([{
    user_id: userId,
    vendor_id: vendorId,
    title: 'Update from your tour provider',
    notification_type: type || 'update',
    notification_message: message,
    is_read: false
}], { session });
```

The `title` field is required by the notification model. Omitting it could cause database validation failure. The type also receives a safe `update` fallback.

Firebase delivery at lines 61–72 is deliberately isolated:

```js
try {
    const targetUser = await User.findById(userId).select('fcm_token');
    if (targetUser && targetUser.fcm_token && admin) {
        await admin.messaging().send({
            token: targetUser.fcm_token,
            notification: {
                title: "تحديث جديد من التاجر",
                body: message
            },
            data: { type: type || "update" }
        });
    }
} catch {
    console.warn(
        'Push delivery failed; the notification remains available in the inbox.'
    );
}
```

The database notification is created before push delivery. If Firebase is unavailable, the saved inbox notification remains valid.

The outer catch at lines 75–78 rethrows database and application errors:

```js
} catch (error) {
    console.error("Failed to send vendor update notification:", error);
    throw error;
}
```

This prevents the API from returning a false success when MongoDB creation actually failed.

### Broadcast method — lines 84–163

Corrected signature:

```js
exports.sendNotificationBroadcastCore = async (
    senderId,
    senderRole,
    notificationData
) => { ... };
```

Authorization and input extraction:

```js
if (!['admin', 'vendor'].includes(senderRole)) {
    throw new AppError(
        'Only admins and vendors can broadcast notifications.',
        403
    );
}

const {
    title,
    message,
    type,
    targetAudience,
    packageId,
    bookingStatus
} = notificationData;
```

#### Admin audience selection — lines 89–95

```js
let query = {
    isActive: true,
    isDelete: { $ne: true },
    deletionRequestedAt: null
};

if (targetAudience === 'users_only') query.role = 'user';
if (targetAudience === 'vendors_only') query.role = 'vendor';

const users = await User.find(query).select('_id');
targetUserIds = users.map(user => user._id);
```

Admins can target all active accounts, only tourist users, or only vendors. Deleted, inactive, or deletion-pending accounts are excluded.

#### Vendor audience selection — lines 96–106

```js
let bookingQuery = {
    vendor_id: senderId,
    isDeleted: { $ne: true }
};

if (packageId) bookingQuery.package_id = packageId;

if (bookingStatus) {
    bookingQuery.status = bookingStatus;
} else {
    bookingQuery.status = {
        $in: ["completed", "accepted", "pending"]
    };
}

targetUserIds = await Booking.distinct("user_id", bookingQuery);
```

A vendor broadcast is derived from bookings owned by the authenticated vendor. Optional package and status filters narrow the audience. Recipient IDs are not accepted directly from the frontend.

#### Correct database sender fields — lines 112–123

```js
const notificationsArray = targetUserIds.map(userId => ({
    user_id: userId,
    admin_id: senderRole === 'admin' ? senderId : null,
    vendor_id: senderRole === 'vendor' ? senderId : null,
    notification_type: type || "broadcast",
    notification_message: message,
    title,
    is_read: false,
    createdAt: new Date()
}));

await Notification.insertMany(notificationsArray);
```

This matches the notification model’s separate `admin_id` and `vendor_id` ownership fields.

#### Firebase token handling — lines 137–156

```js
const deviceTokens = [...new Set(
    usersWithTokens
        .map(user => user.fcm_token)
        .filter(token => typeof token === 'string' && token.trim())
)];

for (let offset = 0; offset < deviceTokens.length; offset += 500) {
    await admin.messaging().sendEachForMulticast({
        ...payload,
        tokens: deviceTokens.slice(offset, offset + 500)
    });
}
```

Empty tokens are removed, duplicates are eliminated, and multicast requests are limited to batches of 500. A Firebase error is logged without deleting the database notifications already inserted.

### Inbox and sent queries — lines 168–223

Received notifications:

```js
let query = visibleNotifications({ user_id: recipientId(user) });
```

Sent notifications:

```js
if (checkRole(user.role, ["vendor"])) query.vendor_id = user._id;
else if (checkRole(user.role, ["admin"])) query.admin_id = user._id;
else {
    throw new AppError(
        "Only vendors and admins can view sent notifications",
        403
    );
}

query = visibleNotifications(query);
```

This makes the sent query use the same ownership field that broadcast creation writes.

### Read and delete ownership — lines 228–304

The four affected methods are:

```js
markAsReadCore(user, notificationId)
markAllAsReadCore(user)
deleteNotificationCore(user, notificationId)
deleteAllNotificationsCore(user)
```

Their database queries include the authenticated recipient:

```js
visibleNotifications({
    _id: notificationId,
    user_id: recipientId(user)
});
```

or, for all records:

```js
visibleNotifications({ user_id: recipientId(user) });
```

This prevents an authenticated user, vendor, or admin from modifying another recipient’s notification merely by learning its UUID.

Note: the current single/all delete methods physically delete matching MongoDB records with `findOneAndDelete()` and `deleteMany()`. They do not perform a soft delete. The visibility helper still supports existing records that use `isDeleted`.

---

## 4. Notification validation

**File:** `backend/src/validations/NotificationsValidation.js`  
**Changed current lines:** 4–33

### Allowed types and shared field rules — lines 4–6

```js
const types = [
    'booking',
    'complaint',
    'feedback',
    'broadcast',
    'update',
    'system_alert',
    'direct_message',
    'marketing'
];

const message = Joi.string().trim().min(5).max(500).required();
const type = Joi.string().valid(...types).optional();
```

These rules constrain text size and prevent arbitrary type values.

### Reusable validation middleware — lines 8–15

```js
function validate(schema, location) {
    return (req, res, next) => {
        const { error, value } = schema.validate(
            req[location],
            { abortEarly: false }
        );

        if (error) {
            return next(new AppError(
                error.details.map(detail => detail.message).join(' | '),
                400
            ));
        }

        req[location] = value;
        next();
    };
}
```

The helper can validate `body`, `params`, or `query`. All validation messages are returned together through the project’s normal `AppError` flow.

Because Joi object schemas reject unknown properties by default, fields such as a forged `vendorId` are rejected rather than trusted.

### Direct notification schema — lines 17–19

```js
exports.validateTargetedNotification = validate(Joi.object({
    userId: Joi.string().uuid().required(),
    type,
    message
}), 'body');
```

The previous schema expected one or more 24-character MongoDB ObjectIds and also required a title. The current direct controller expects a single UUID `userId`, while the service supplies the standard title.

### Broadcast schema — lines 21–27

```js
exports.validateBroadcast = validate(Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    message,
    type,
    targetAudience: Joi.string()
        .valid('all', 'users_only', 'vendors_only')
        .optional(),
    packageId: Joi.string().uuid().optional(),
    bookingStatus: Joi.string()
        .valid(
            'pending_payment',
            'pending',
            'accepted',
            'completed',
            'rejected',
            'cancelled'
        )
        .optional()
}), 'body');
```

The package and booking-status fields correspond to the vendor audience filters used in `sendNotificationBroadcastCore()`.

### UUID and pagination schemas — lines 29–33

```js
exports.validateNotificationIdParam = validate(
    Joi.object({ id: Joi.string().uuid().required() }),
    'params'
);

exports.validateNotificationQuery = validate(Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
}), 'query');
```

The UUID rule matches the identifiers used by this version of the backend. Pagination defaults are applied to `req.query`, and oversized queries are rejected.

---

## 5. Firebase configuration

**File:** `backend/src/config/firebaseConfig.js`  
**Changed current lines:** 3–12

### Current implementation

```js
try {
    const serviceAccount = require('./serviceAccountKey.json');

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    console.log("[Firebase] Successfully initialized in config.");
    module.exports = admin;
} catch (error) {
    console.warn(
        '[Firebase] Push unavailable; database notifications remain enabled. ' +
        'Check serviceAccountKey.json.'
    );
    module.exports = null;
}
```

### Exact problems addressed

1. The previous code called `admin.cert(serviceAccount)`. The Firebase Admin SDK method is `admin.credential.cert(serviceAccount)`.
2. `admin.apps.length` prevents duplicate initialization if this module is loaded more than once in the same process.
3. Loading `serviceAccountKey.json` inside `try` means a missing or invalid file enters the fallback path instead of crashing during the top-level `require()`.
4. Exporting `null` clearly tells the notification service that push delivery is unavailable.
5. MongoDB inbox notifications and Socket.io can continue without Firebase push.

This change does **not** manufacture Firebase credentials and does not prove delivery to a physical device. A real service-account file, Firebase project configuration, browser/mobile permission, and a current FCM token are still required.

---

## 6. Cloudinary configuration

**File:** `backend/src/config/cloudinaryConfig.js`  
**Changed current lines:** 3–17

### Current implementation

```js
const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
};

const missingValues = Object.entries(cloudinaryConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

if (missingValues.length) {
    throw new Error(
        `Cloudinary configuration is missing: ${missingValues.join(", ")}`
    );
}

cloudinary.config(cloudinaryConfig);
```

### Why this was changed

The configuration used raw environment values. An accidental leading or trailing space—especially in `CLOUDINARY_CLOUD_NAME`—changes the credential value and makes Cloudinary requests fail.

Package creation uploads package images before completing the database creation flow. Therefore, an invalid Cloudinary cloud name can look like “the package was not added to the database,” even though the first failure actually occurred during image upload.

The new code:

- removes accidental surrounding whitespace;
- detects absent or whitespace-only values immediately;
- reports exactly which Cloudinary setting is missing;
- prevents the application from continuing with a silently broken upload configuration.

No Cloudinary secrets are recorded in this report.

---

## 7. Isolated regression tests

### Notification tests

**File:** `backend/tests/notifications-isolated.test.cjs`  
**Length:** 161 lines

The 11 tests verify:

1. Broadcast controllers use the authenticated sender ID and role.
2. Admin broadcast records use `admin_id` and validate against the notification model.
3. Vendor broadcasts target customers booked with that vendor.
4. Ordinary users receive 403 when attempting to broadcast.
5. An empty target audience returns 404 instead of false success.
6. Vendor inbox queries use `owner_user_id`.
7. Admin sent queries use `admin_id`.
8. Read and delete operations stay within the authenticated inbox.
9. Direct notifications contain a required title and survive Firebase failure.
10. MongoDB failures propagate instead of returning success.
11. UUID validation, forged sender rejection, and pagination limits work.

### Cloudinary tests

**File:** `backend/tests/cloudinary-config-isolated.test.cjs`  
**Length:** 42 lines

The two tests verify:

1. Whitespace is removed from all three Cloudinary values.
2. A missing or whitespace-only value produces a clear startup error.

### Latest execution result

Command executed from the backend directory:

```powershell
node --test tests/notifications-isolated.test.cjs tests/cloudinary-config-isolated.test.cjs
```

Result:

```text
tests:   13
passed:  13
failed:  0
skipped: 0
```

The test runner printed a Mongoose warning that `Document.prototype.validateSync()` is deprecated for future Mongoose 10. That warning occurs inside the isolated test assertions and did not fail the tests or indicate a runtime failure in the modified API methods.

### Git warning about the tests

The existing line below in `backend/.gitignore` ignores the entire test directory:

```gitignore
/tests
```

Consequently, the two test files will not be committed by a normal `git add`. This report does not change that ignore rule because the requested scope here is documentation.

---

## 8. What was not changed

The current Git diff confirms that this work did not modify:

- authentication controllers;
- vendor registration controllers;
- package controllers or package routes;
- booking controllers;
- database models;
- `backend/package.json`;
- `backend/package-lock.json`;
- `backend/src/config.env`;
- the original Xenon project outside the `xenon try fix` copy.

The package-add symptom was addressed only at its verified Cloudinary configuration failure point. No package records were manually inserted into the public database.

---

## 9. What is proven and what remains external

### Proven locally by the isolated tests

- Correct authenticated sender arguments reach broadcast logic.
- Vendor/customer direct-notification authorization is enforced.
- Correct notification model fields are produced.
- Vendor/admin audience selection behaves as designed.
- Inbox ownership is enforced for read and delete operations.
- Invalid UUIDs and pagination are rejected.
- Firebase failure does not remove a saved inbox notification.
- Cloudinary values are trimmed and missing values fail clearly.

### Still requires live integration testing

- Actual Firebase delivery to a browser or mobile device.
- Validity and permissions of the real Firebase service-account key.
- Creation and refresh of actual FCM device tokens.
- Socket.io delivery between separate real devices.
- Live public-database notification delivery with production accounts.
- A complete package submission with real image files followed by confirmation in MongoDB.
- Cloudinary account quota, folder permissions, and production transformation behavior.

This distinction is intentional: isolated tests prove the repaired application logic without using real credentials, but they cannot prove the health of external accounts or delivery to physical devices.
