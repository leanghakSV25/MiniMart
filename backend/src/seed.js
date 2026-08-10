require("dotenv").config({
  path: require("path").join(__dirname, "../.env")
});

const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const User = require("./models/User");
const Product = require("./models/Product");
const Customer = require("./models/Customer");
const Expense = require("./models/Expense");
const Order = require("./models/Order");
const Purchase = require("./models/Purchase");
const Supplier = require("./models/Supplier");

async function seed() {
  try {
    // =========================
    // CONNECT MONGODB
    // =========================
    await connectDB();
    console.log("MongoDB connected successfully.");

    // =========================
    // 1. USER
    // =========================
    const password = await bcrypt.hash("admin123", 10);

    await User.updateOne(
      { email: "admin@example.com" },
      {
        $set: {
          name: "Super Admin",
          email: "admin@example.com",
          password,
          role: "admin",
          active: true
        }
      },
      { upsert: true }
    );

    console.log("✓ User seeded");

    // =========================
    // 2. PRODUCTS
    // =========================
    const products = [
      {
        code: "P001",
        name: "Coca Cola",
        category: "Drinks",
        unit: "bottle",
        buyPrice: 0.45,
        sellPrice: 0.75,
        stock: 50,
        minStock: 10
      },
      {
        code: "P002",
        name: "Water",
        category: "Drinks",
        unit: "bottle",
        buyPrice: 0.20,
        sellPrice: 0.50,
        stock: 80,
        minStock: 15
      },
      {
        code: "P003",
        name: "Potato Chips",
        category: "Snacks",
        unit: "bag",
        buyPrice: 0.50,
        sellPrice: 1.00,
        stock: 40,
        minStock: 8
      }
    ];

    for (const product of products) {
      await Product.updateOne(
        { code: product.code },
        { $set: product },
        { upsert: true }
      );
    }

    console.log("✓ Products seeded");

    // =========================
    // 3. CUSTOMERS
    // =========================
    const customers = [
      {
        name: "John Customer",
        phone: "012345678",
        email: "john@example.com",
        address: "Phnom Penh"
      },
      {
        name: "Dara Customer",
        phone: "098765432",
        email: "dara@example.com",
        address: "Siem Reap"
      }
    ];

    for (const customer of customers) {
      await Customer.updateOne(
        { phone: customer.phone },
        { $set: customer },
        { upsert: true }
      );
    }

    console.log("✓ Customers seeded");

    // =========================
    // 4. SUPPLIERS
    // =========================
    const suppliers = [
      {
        name: "ABC Supplier",
        phone: "011111111",
        email: "abc@example.com",
        address: "Phnom Penh"
      },
      {
        name: "XYZ Supplier",
        phone: "022222222",
        email: "xyz@example.com",
        address: "Kandal"
      }
    ];

    for (const supplier of suppliers) {
      await Supplier.updateOne(
        { phone: supplier.phone },
        { $set: supplier },
        { upsert: true }
      );
    }

    console.log("✓ Suppliers seeded");

    // =========================
    // 5. EXPENSES
    // =========================
    const expenses = [
      {
        title: "Electricity",
        amount: 50,
        category: "Utilities",
        description: "Monthly electricity bill",
        date: new Date()
      },
      {
        title: "Shop Rent",
        amount: 200,
        category: "Rent",
        description: "Monthly shop rent",
        date: new Date()
      }
    ];

    for (const expense of expenses) {
      await Expense.create(expense);
    }

    console.log("✓ Expenses seeded");

    // =========================
    // FIND DATA
    // =========================
    const supplier = await Supplier.findOne({
      phone: "011111111"
    });

    const product = await Product.findOne({
      code: "P001"
    });

    const customer = await Customer.findOne({
      phone: "012345678"
    });

    // =========================
    // 6. PURCHASE
    // =========================
    if (supplier && product) {
      await Purchase.create({
        supplierId: supplier._id,

        items: [
          {
            productId: product._id,
            quantity: 20,
            buyPrice: 0.45
          }
        ],

        total: 9,

        date: new Date()
      });

      console.log("✓ Purchase seeded");
    }

    // =========================
    // 7. ORDER
    // =========================
    if (customer && product) {
      const quantity = 2;
      const price = 0.75;
      const subtotal = quantity * price;

      await Order.create({
        invoiceNumber: `INV-${Date.now()}`,

        customerId: customer._id,

        items: [
          {
            productId: product._id,
            quantity: quantity,
            price: price,
            subtotal: subtotal
          }
        ],

        subtotal: subtotal,
        total: subtotal,

        date: new Date()
      });

      console.log("✓ Order seeded");
    }

    // =========================
    // COMPLETE
    // =========================
    console.log("");
    console.log("====================================");
    console.log("          SEED COMPLETE");
    console.log("====================================");
    console.log("✓ users");
    console.log("✓ products");
    console.log("✓ customers");
    console.log("✓ suppliers");
    console.log("✓ expenses");
    console.log("✓ purchases");
    console.log("✓ orders");
    console.log("====================================");
    console.log("Login:");
    console.log("Email:    admin@example.com");
    console.log("Password: admin123");
    console.log("====================================");

    process.exit(0);

  } catch (error) {
    console.error("");
    console.error("====================================");
    console.error("             SEED ERROR");
    console.error("====================================");
    console.error(error.message);
    console.error("====================================");

    process.exit(1);
  }
}

seed();