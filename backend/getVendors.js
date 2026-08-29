const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './src/config.env' });
const User = require('./src/Models/UserModel');
const DB = process.env.DATABASE.includes('<PASSWORD>')
    ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
    : process.env.DATABASE;

mongoose.connect(DB).then(async () => {
    const fifteenMinsAgo = new Date(Date.now() - 30 * 60000);
    const users = await User.find({ role: 'vendor', createdAt: { $gte: fifteenMinsAgo } }).select('email name');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
});
