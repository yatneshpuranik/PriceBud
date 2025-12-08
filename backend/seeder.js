import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

import users from "./data/users.js";
import products from "./data/product.js";

import User from "./models/userModel.js";
import Product from "./models/productModel.js";

import connectDb from "./config/db.js";

dotenv.config();
connectDb();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Prepare products (use platforms exactly as in your data)
    const preparedProducts = products.map((p) => {
      return {
        user: adminUser,
        title: p.name,
        image: p.image,
        description: p.description,
        platforms: p.platforms,     // ← DIRECT USE, NO PROCESSING
      };
    });

    // Insert products
    await Product.insertMany(preparedProducts);

    console.log("✅ PRODUCTS SEEDED SUCCESSFULLY!".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();

    console.log("❌ DATA DESTROYED!".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
