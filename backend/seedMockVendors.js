const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const { faker } = require("@faker-js/faker");

dotenv.config({ path: "./src/config.env" });

const User = require("./src/Models/UserModel");
const Vendor = require("./src/Models/VendorModel");
const Package = require("./src/Models/PackageModel");

const DB = process.env.DATABASE.includes('<PASSWORD>')
    ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
    : process.env.DATABASE;

mongoose.connect(DB).then(() => {
    console.log("DB connection successful!");
}).catch(err => {
    console.log("DB connection failed:", err);
});

const generateVendorsAndPackages = async () => {
    try {
        console.log("Starting Seeder...");
        
        const vendorIds = [];
        
        // Create 6 Vendors
        for (let i = 0; i < 6; i++) {
            const mobileNumber = '079' + faker.string.numeric(7);
            
            // Create User (Owner)
            const newUser = await User.create({
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: "password123",
                mobileNumber: mobileNumber,
                role: "vendor",
                gender: faker.helpers.arrayElement(["male", "female"]),
                DateOfBirth: faker.date.birthdate({ min: 25, max: 60, mode: 'age' })
            });

            // Create Vendor Profile
            const newVendor = await Vendor.create({
                owner_user_id: newUser._id,
                vendor_company_name: faker.company.name(),
                vendor_address: faker.location.streetAddress(),
                vendor_city: faker.location.city(),
                vendor_status: "active"
            });
            
            vendorIds.push(newVendor._id);
            console.log(`Created Vendor ${i + 1}: ${newVendor.vendor_company_name}`);
        }

        // Create 20 Packages for each Vendor
        const packageTypes = ['adventure', 'cultural', 'relaxation', 'historical', 'family'];
        
        for (let vendorId of vendorIds) {
            for (let j = 0; j < 20; j++) {
                const startDate = faker.date.future({ years: 1 });
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 14 }));
                
                await Package.create({
                    vendor_id: vendorId,
                    package_name: faker.lorem.words(3).toUpperCase() + " Trip",
                    package_description: faker.lorem.paragraph(3),
                    package_price: faker.number.int({ min: 50, max: 2000 }),
                    startDate: startDate,
                    endDate: endDate,
                    images: [
                        { url: faker.image.urlPicsumPhotos(), public_id: `mock_pic_${uuidv4()}` }
                    ],
                    tags: [faker.word.adjective(), faker.word.noun()],
                    package_type: faker.helpers.arrayElement(packageTypes),
                    package_status: "active",
                    max_people: faker.number.int({ min: 10, max: 50 })
                });
            }
            console.log(`Created 20 packages for Vendor ID: ${vendorId}`);
        }

        console.log("Seeding Completed Successfully!");
        process.exit();
    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
};

generateVendorsAndPackages();
