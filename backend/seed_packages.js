const mongoose = require('mongoose');
const Package = require('./src/Models/PackageModel');

const DB = "mongodb://localhost:27017/Xenon"; // Or cluster string if they are using it.
// Let's check server.js to see if it connects to LOCAL or REMOTE.
// Wait, I'll just use mongoose.connect and the cluster URI since it's hardcoded in config.env.
const DB_URI = "mongodb+srv://mustafaalkayyali48_db_user:GwcFCVw5rJPgA0y3@cluster0.tk1ot6j.mongodb.net/?appName=Cluster0";

mongoose.connect(DB_URI).then(async () => {
    console.log("DB connected successfully");

    const vendorId = "01a01ff1-2de8-7bf9-95c2-8b0d46cc28f5"; // From the fix-ownership route

    const dummyPackages = [
        {
            vendor_id: vendorId,
            package_name: "Mount Everest Base Camp Trek",
            package_description: "An adventurous 14-day trek to the base camp of the highest mountain in the world.",
            package_price: 2500,
            startDate: new Date("2026-10-01"),
            endDate: new Date("2026-10-15"),
            images: [
                { url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop", public_id: "everest_1" }
            ],
            package_type: "adventure",
            package_status: "active",
            max_people: 15,
            available_seats: 15
        },
        {
            vendor_id: vendorId,
            package_name: "Kyoto Cultural Immersion",
            package_description: "Experience the traditional tea ceremonies, temples, and geisha districts of Kyoto.",
            package_price: 1800,
            startDate: new Date("2026-11-05"),
            endDate: new Date("2026-11-12"),
            images: [
                { url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop", public_id: "kyoto_1" }
            ],
            package_type: "cultural",
            package_status: "active",
            max_people: 10,
            available_seats: 10
        },
        {
            vendor_id: vendorId,
            package_name: "Bali Wellness Retreat",
            package_description: "7 days of yoga, meditation, and spa treatments in the serene jungles of Ubud.",
            package_price: 1200,
            startDate: new Date("2026-12-01"),
            endDate: new Date("2026-12-08"),
            images: [
                { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop", public_id: "bali_1" }
            ],
            package_type: "relaxation",
            package_status: "active",
            max_people: 20,
            available_seats: 20
        },
        {
            vendor_id: vendorId,
            package_name: "Disney World Orlando Family Trip",
            package_description: "The ultimate family vacation with VIP access to all 4 Disney theme parks.",
            package_price: 3500,
            startDate: new Date("2027-01-10"),
            endDate: new Date("2027-01-17"),
            images: [
                { url: "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?q=80&w=1000&auto=format&fit=crop", public_id: "disney_1" }
            ],
            package_type: "family",
            package_status: "active",
            max_people: 30,
            available_seats: 30
        }
    ];

    try {
        await Package.insertMany(dummyPackages);
        console.log("Dummy packages seeded successfully!");
    } catch (err) {
        console.error("Error seeding packages:", err);
    }
    process.exit();
}).catch(err => {
    console.error("DB connection error:", err);
    process.exit();
});
