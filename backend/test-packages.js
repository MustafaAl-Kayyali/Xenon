const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const JWT_SECRET = "4223ca57eb0a4b0777df34b7a99718684472daa0c9c367958cb0cbb33d7d72ca465948c80f09c06b39dc37e71ef057112580f8b0b92803eea5020a6ded11570c";
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/api/v1/packages`;

const DB_URL = "mongodb+srv://mustafaalkayyali48_db_user:GwcFCVw5rJPgA0y3@cluster0.tk1ot6j.mongodb.net/?appName=Cluster0";
const User = require("./src/Models/UserModel");

const runTests = async () => {
    let createdPackageId = null;

    console.log("==========================================");
    console.log("   TESTING PACKAGE APIs");
    console.log("==========================================");

    await mongoose.connect(DB_URL);
    console.log("Connected to DB to fetch a vendor...");
    
    let vendor = await User.findOne({ role: "vendor" });
    if (!vendor) {
        console.log("No vendor found in DB, creating a dummy vendor for tests.");
        const { v7: uuidv7 } = require("uuid");
        vendor = await User.create({
            _id: uuidv7(),
            name: "Test Vendor",
            email: "vendor@test.com",
            password: "password123",
            mobileNumber: "0785567329",
            role: "vendor",
            isActive: true,
            isVerified: true
        });
    }

    const token = jwt.sign({ id: vendor._id }, JWT_SECRET, { expiresIn: "90d" });

    // 1. CREATE PACKAGE (POST /create-package)
    try {
        console.log("\n1. Testing POST /create-package ...");
        const formData = new FormData();
        formData.append("package_name", "Test Package " + Date.now());
        formData.append("package_price", "150");
        formData.append("package_description", "An amazing test package.");
        formData.append("package_type", "Adventure");
        formData.append("package_status", "active");
        formData.append("startDate", "2026-09-01T08:00:00.000Z");
        formData.append("endDate", "2026-09-04T18:00:00.000Z");
        
        // Create a valid 1x1 PNG image
        const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        const buffer = Buffer.from(base64Png, "base64");
        const blob = new Blob([buffer], { type: "image/png" });
        formData.append("package_image", blob, "test.png");

        const res = await fetch(`${BASE_URL}/create-package`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 201) {
            console.log("✅ Create Package SUCCESS!");
            createdPackageId = data.data.package.id || data.data.package._id;
        } else {
            console.log("❌ Create Package FAILED:", data);
        }
    } catch (err) {
        console.log("❌ Error:", err.message);
    }

    // 2. GET ALL PACKAGES (GET /)
    try {
        console.log("\n2. Testing GET / ...");
        const res = await fetch(`${BASE_URL}/`, {
            method: "GET"
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log(`✅ Get All Packages SUCCESS! Found ${data.data.packages ? data.data.packages.length : 0} packages.`);
        } else {
            console.log("❌ Get All Packages FAILED:", data);
        }
    } catch (err) {
        console.log("❌ Error:", err.message);
    }

    if (!createdPackageId) {
        console.log("\nSkipping GET, UPDATE, DELETE tests because package creation failed.");
        return;
    }

    // 3. GET PACKAGE BY ID (GET /package/:id)
    try {
        console.log(`\n3. Testing GET /package/${createdPackageId} ...`);
        const res = await fetch(`${BASE_URL}/package/${createdPackageId}`, {
            method: "GET"
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log("✅ Get Single Package SUCCESS!");
        } else {
            console.log("❌ Get Single Package FAILED:", data);
        }
    } catch (err) {
        console.log("❌ Error:", err.message);
    }

    // 4. UPDATE PACKAGE (PUT /package/:id)
    try {
        console.log(`\n4. Testing PUT /package/${createdPackageId} ...`);
        const formData = new FormData();
        formData.append("package_price", "200");
        formData.append("package_name", "Updated Test Package");

        const res = await fetch(`${BASE_URL}/package/${createdPackageId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}` // Assuming protect might be needed soon
            },
            body: formData
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log("✅ Update Package SUCCESS!");
        } else {
            console.log("❌ Update Package FAILED:", data);
        }
    } catch (err) {
        console.log("❌ Error:", err.message);
    }

    // 5. DELETE PACKAGE (PUT /delete-package/:id)
    try {
        console.log(`\n5. Testing PUT /delete-package/${createdPackageId} ...`);
        const res = await fetch(`${BASE_URL}/delete-package/${createdPackageId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}` 
            }
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log("✅ Delete Package SUCCESS!");
        } else {
            console.log("❌ Delete Package FAILED:", data);
        }
    } catch (err) {
        console.log("❌ Error:", err.message);
    }
    
    await mongoose.disconnect();
};

runTests();