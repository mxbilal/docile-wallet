const mongoose = require("mongoose");

const withDrawRequestsSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
    },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    status: {
      type: String,
      enum: ["in-progress", "rejected", "approved"],
      default: "in-progress"
    },
  },
  { timestamps: true }
);

// Create and export the User model
const WithDrawRequests = mongoose.model("withdraw_requests", withDrawRequestsSchema);
module.exports = WithDrawRequests;
