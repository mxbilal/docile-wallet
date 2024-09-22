const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.Mixed
    },
    user_id: String,
    razorpay_payment_id: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Create and export the User model
const PaymentSchema = mongoose.model("payments", paymentSchema);
module.exports = PaymentSchema;
