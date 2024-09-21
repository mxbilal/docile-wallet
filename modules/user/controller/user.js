require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
var ObjectId = require("mongoose").Types.ObjectId;

// Register user
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      firsName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      parentReferel,
      bankDetails,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const child = await User.find({
      "parentReferel.parentId": parentReferel.parentId,
    });

    if (child.length > 1) {
      return res.status(400).json({
        success: false,
        message: "This leader already have complete pair",
      });
    }
    if (child.some((a) => a.referralType === parentReferel?.referralType)) {
      return res.status(400).json({
        success: false,
        message: `Referel Type of side ${parentReferel.referralType}  already exist`,
      });
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firsName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      parentReferel,
      bankDetails,
    });

    res.status(201).json({
      success: true,
      message: "user registered successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.bankDetails.fullName,
        dateOfJoin: newUser.createdAt,
        phoneNumber: newUser.phoneNumber,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { docileId, password } = req.body;

  if (!docileId || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both Docile ID and password",
    });
  }

  try {
    const user = await User.findOne({ _id: new ObjectId(docileId) });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid Docile ID or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        success: false,
        message: "Invalid Docile ID or password",
      });
    }

    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });

    // Send back the token and user info
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        title: user.title,
        firstname: user.firstname,
        lastname: user.lastname,
        country: user.country,
        stripe_customer_id: user.stripe_customer_id,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
