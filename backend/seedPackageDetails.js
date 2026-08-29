const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");

dotenv.config({ path: "./src/config.env" });

const Package = require("./src/Models/PackageModel");
const PackageDetails = require("./src/Models/packageDetailsModels");

const DB = process.env.DATABASE.includes('<PASSWORD>')
    ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
    : process.env.DATABASE;

mongoose.connect(DB).then(async () => {
    console.log("DB connection successful! Seeding PackageDetails...");
    try {
        const packages = await Package.find({});
        console.log(`Found ${packages.length} packages. Checking for missing details...`);
        
        const existingDetails = await PackageDetails.find({}).select('package_id');
        const existingIds = existingDetails.map(d => d.package_id.toString());
        
        const toCreate = [];
        for (let pkg of packages) {
            if (!existingIds.includes(pkg._id.toString())) {
                const diffTime = Math.abs(pkg.endDate - pkg.startDate);
                const tripDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                
                const itinerary = [];
                for (let day = 1; day <= tripDays; day++) {
                    itinerary.push({
                        day_number: day,
                        title: faker.lorem.words(3),
                        activities: faker.lorem.paragraph(1)
                    });
                }

                toCreate.push({
                    package_id: pkg._id,
                    itinerary: itinerary,
                    included_services: [
                        { title: "Transportation", description: "Full AC Bus" },
                        { title: "Meals", description: "Breakfast & Lunch included" }
                    ],
                    excluded_services: [
                        { title: "Personal Expenses", description: "Souvenirs, extra snacks, etc." }
                    ],
                    meeting_point: faker.location.streetAddress() + ", " + faker.location.city(),
                    location_coordinates: {
                        lat: faker.location.latitude(),
                        lng: faker.location.longitude()
                    },
                    cancellation_policy: "Free cancellation up to 48 hours before the trip.",
                    important_notes: "Please arrive 15 minutes before departure."
                });
            }
        }
        
        if (toCreate.length > 0) {
            console.log(`Inserting ${toCreate.length} package details...`);
            await PackageDetails.insertMany(toCreate);
            console.log(`Successfully created details for ${toCreate.length} packages!`);
        } else {
            console.log("All packages already have details.");
        }
        process.exit();
    } catch (error) {
        console.error("Error generating package details:", error);
        process.exit(1);
    }
}).catch(err => {
    console.error("DB connection failed:", err);
    process.exit(1);
});
