const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const { faker } = require("@faker-js/faker");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "src/config.env") });

const Vendor = require("./src/Models/VendorModel");
const Package = require("./src/Models/PackageModel");
const PackageDetails = require("./src/Models/packageDetailsModels");
const FileStorageService = require("./src/services/Integration/FileStorageService");

const DB = process.env.DATABASE.includes('<PASSWORD>')
    ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
    : process.env.DATABASE;

mongoose.connect(DB).then(async () => {
    console.log("DB connection successful! Starting Cloudinary Package Seeder...");
    try {
        const vendorEmails = [
            "greyson_reichert@gmail.com",
            "kory_klein57@hotmail.com",
            "johnny_murphy@gmail.com",
            "sandy3@gmail.com",
            "else_hauck96@hotmail.com",
            "margie_dietrich@gmail.com"
        ];

        // We find the users first to get their IDs
        const User = require("./src/Models/UserModel");
        const users = await User.find({ email: { $in: vendorEmails } });
        const userIds = users.map(u => u._id);

        const vendors = await Vendor.find({ owner_user_id: { $in: userIds } });
        
        if (vendors.length === 0) {
            console.log("No vendors found for those emails!");
            process.exit(1);
        }

        console.log(`Found ${vendors.length} vendors.`);
        
        // Delete old packages & details for these vendors to start fresh
        for (const v of vendors) {
            const oldPkgs = await Package.find({ vendor_id: v._id });
            const oldPkgIds = oldPkgs.map(p => p._id);
            await PackageDetails.deleteMany({ package_id: { $in: oldPkgIds } });
            await Package.deleteMany({ vendor_id: v._id });
            console.log(`Cleared old packages for vendor ${v.vendor_company_name}`);
        }

        const packageTypes = ['adventure', 'cultural', 'relaxation', 'historical', 'family'];

        let totalUploaded = 0;

        for (const vendor of vendors) {
            console.log(`\n================================`);
            console.log(`Seeding 20 packages for Vendor: ${vendor.vendor_company_name}`);
            console.log(`================================`);
            
            for (let i = 0; i < 20; i++) {
                // 1. Upload to Cloudinary using Faker random URL
                const randomImageUrl = faker.image.urlPicsumPhotos();
                let uploadResult;
                try {
                    // This uploads the remote image to Cloudinary
                    uploadResult = await FileStorageService.uploadImage(randomImageUrl, "xenon/mock_packages");
                } catch (err) {
                    console.error("Cloudinary upload failed for an image, using fallback...");
                    uploadResult = {
                        secure_url: randomImageUrl,
                        public_id: `fallback_${uuidv4()}`
                    };
                }

                // 2. Create the Package
                const startDate = faker.date.future({ years: 1 });
                const tripLength = faker.number.int({ min: 1, max: 14 });
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + tripLength);

                const newPkg = await Package.create({
                    vendor_id: vendor._id,
                    package_name: faker.lorem.words({ min: 2, max: 4 }).toUpperCase() + " EXPEDITION",
                    package_description: faker.lorem.paragraph(5),
                    package_price: faker.number.int({ min: 100, max: 5000 }),
                    startDate: startDate,
                    endDate: endDate,
                    images: [
                        { url: uploadResult.secure_url, public_id: uploadResult.public_id }
                    ],
                    tags: [faker.word.adjective(), faker.location.country()],
                    package_type: faker.helpers.arrayElement(packageTypes),
                    package_status: "active",
                    max_people: faker.number.int({ min: 5, max: 50 })
                });

                // 3. Create Package Details
                const itinerary = [];
                for (let day = 1; day <= tripLength; day++) {
                    itinerary.push({
                        day_number: day,
                        title: `Day ${day}: ` + faker.lorem.words(3),
                        activities: faker.lorem.paragraph(2)
                    });
                }

                await PackageDetails.create({
                    package_id: newPkg._id,
                    itinerary: itinerary,
                    included_services: [
                        { title: "Transportation", description: "Luxury Coach" },
                        { title: "Accommodation", description: "5-Star Hotel" },
                        { title: "Meals", description: "All-inclusive" }
                    ],
                    excluded_services: [
                        { title: "Flights", description: "International airfare" },
                        { title: "Visa", description: "Visa processing fees" }
                    ],
                    meeting_point: faker.location.streetAddress() + ", " + faker.location.city(),
                    location_coordinates: {
                        lat: faker.location.latitude(),
                        lng: faker.location.longitude()
                    },
                    cancellation_policy: "100% refund if cancelled 7 days prior. 50% refund if cancelled within 3 days.",
                    important_notes: "Bring warm clothes. Passport valid for 6 months required."
                });

                totalUploaded++;
                process.stdout.write(`✅ Package ${i+1}/20 created... `);
            }
            console.log(`\nSuccessfully created 20 packages for ${vendor.vendor_company_name}!`);
        }

        console.log(`\n🎉 All Done! Created ${totalUploaded} packages and uploaded their images to Cloudinary.`);
        process.exit(0);

    } catch (error) {
        console.error("Error generating package details:", error);
        process.exit(1);
    }
}).catch(err => {
    console.error("DB connection failed:", err);
    process.exit(1);
});
