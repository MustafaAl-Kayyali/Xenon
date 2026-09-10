const cloudinary = require("cloudinary").v2;

const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
};

const missingValues = Object.entries(cloudinaryConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

if (missingValues.length) {
    throw new Error(`Cloudinary configuration is missing: ${missingValues.join(", ")}`);
}

cloudinary.config(cloudinaryConfig);

module.exports = cloudinary;
