const Product = require("../models/Product");
const Order = require("../models/Order");

exports.summary = async (req, res) => {
  try {
    const [products, orders, sales] = await Promise.all([
      Product.countDocuments({ active: true }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }])
    ]);

    const lowStock = await Product.countDocuments({
      active: true,
      $expr: { $lte: ["$stock", "$minStock"] }
    });

    res.json({
      products,
      orders,
      sales: sales[0]?.total || 0,
      lowStock
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
