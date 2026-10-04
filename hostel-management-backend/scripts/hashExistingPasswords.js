const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const hashExistingPasswords = async () => {
    try {
        // Connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Atlas connected");

        // Get all users
        const users = await User.find({});

        console.log(`Found ${users.length} users`);

        for (const user of users) {
            // Skip if password is already a bcrypt hash
            if (
                user.password.startsWith("$2a$") ||
                user.password.startsWith("$2b$") ||
                user.password.startsWith("$2y$")
            ) {
                console.log(`Skipping ${user.email} - already hashed`);
                continue;
            }

            // Hash existing plain-text password
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Update password
            user.password = hashedPassword;
            await user.save();

            console.log(`Password hashed for ${user.email}`);
        }

        console.log("Password migration completed successfully");

    } catch (error) {
        console.error("Password migration failed:");
        console.error(error.message);

    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
};

hashExistingPasswords();