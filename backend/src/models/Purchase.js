const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        buyPrice: { type: Number, required: true, min: 0 }
      }
    ],
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["received", "pending"], default: "received" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
