const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    firstName: {
      type: String,
      required: [true, "Please enter your first name"],
    },
    lastName: {
      type: String,
      required: [true, "Please enter your last name"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please enter your phone number"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please enter your date of birth"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Please specify your gender"],
    },
    aadharNumber: { type: String },
    isActivePartner: { type: Boolean, default: false },
    bonusCount: { type: Number, default: 0 },
    walletAmount: { type: Number, default: 0 },
    referelBonus: { type: Number, default: 0 },
    parentReferel: {
      parentId: String,
      referralType: String,
    },
    bankDetails: {
      accountNumber: { type: String, required: true },
      IFSCcode: { type: String, required: true },
      SWIFTcode: { type: String, required: false },
      bankName: { type: String, required: true },
      branchName: { type: String, required: true },
      panNumber: { type: String, required: true },
      fullName: { type: String, required: true },
    },
  },
  { timestamps: true }
);

// Create and export the User model
const User = mongoose.model("users", userSchema);
module.exports = User;
