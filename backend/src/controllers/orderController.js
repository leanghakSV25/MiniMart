const Order = require("../models/Order");
const Product = require("../models/Product");

exports.create = async (req, res) => {
  const session = await Product.startSession();
  try {
    const { items, discount = 0, paid = 0, paymentMethod = "cash", customerId = null } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    const normalized = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      const lineTotal = product.sellPrice * item.quantity;
      subtotal += lineTotal;
      normalized.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.sellPrice,
        subtotal: lineTotal
      });
    }

    const total = Math.max(0, subtotal - Number(discount));
    if (Number(paid) < total) {
      return res.status(400).json({ message: "Paid amount is less than total" });
    }

    session.startTransaction();

    for (const item of normalized) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    const invoiceNumber = `INV-${Date.now()}`;
    const [order] = await Order.create(
      [{
        invoiceNumber,
        customerId,
        cashierId: req.user?.id || null,
        items: normalized,
        subtotal,
        discount: Number(discount),
        total,
        paid: Number(paid),
        change: Number(paid) - total,
        paymentMethod
      }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(order);
  } catch (error) {
    try { await session.abortTransaction(); } catch {}
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.getAll = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
