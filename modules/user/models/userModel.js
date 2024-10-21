const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
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
      required: [false, "Please enter your date of birth"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [false, "Please specify your gender"],
    },
    created_by: {
      type: String,
      enum: ["super_admin", "self"],
      default: "self"
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
      accountNumber: { type: String, required: false },
      IFSCcode: { type: String, required: false },
      SWIFTcode: { type: String, required: false },
      bankName: { type: String, required: false },
      branchName: { type: String, required: false },
      panNumber: { type: String, required: false },
      fullName: { type: String, required: false },
    },
  },
  { timestamps: true }
);

// Create and export the User model
const User = mongoose.model("users", userSchema);
module.exports = User;
