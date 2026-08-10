require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");

async function seed() {
  await connectDB();

  const password = await bcrypt.hash("admin123", 10);
  await User.updateOne(
    { email: "admin@example.com" },
    { $set: { name: "Super Admin", email: "admin@example.com", password, role: "admin", active: true } },
    { upsert: true }
  );

  const products = [
    { code: "P001", name: "Coca Cola", category: "Drinks", unit: "bottle", buyPrice: 0.45, sellPrice: 0.75, stock: 50, minStock: 10 },
    { code: "P002", name: "Water", category: "Drinks", unit: "bottle", buyPrice: 0.20, sellPrice: 0.50, stock: 80, minStock: 15 },
    { code: "P003", name: "Potato Chips", category: "Snacks", unit: "bag", buyPrice: 0.50, sellPrice: 1.00, stock: 40, minStock: 8 }
  ];

  for (const p of products) {
    await Product.updateOne({ code: p.code }, { $set: p }, { upsert: true });
  }

  console.log("Seed complete.");
  console.log("Login: admin@example.com / admin123");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
