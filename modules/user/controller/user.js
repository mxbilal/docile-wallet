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
      firstName,
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
    if (
      child.some(
        (a) => a.parentReferel.referralType === parentReferel?.referralType
      )
    ) {
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
      firstName,
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

    const direct = await User.find({ "parentReferel.parentId": user._id });
    const parent =
      user.parentReferel.parentId !== "abc123"
        ? await User.findOne({
            _id: new ObjectId(user.parentReferel.parentId),
          })
        : {};

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        isActive: user.isActive,
        fullName: user.firstName + " " + user.lastName,
        parent: user.parentReferel,
        docileWallet: user.walletAmount,
        referralBonus: user.referelBonus,
      },
      directPartners: direct.map((dt) => {
        return {
          id: dt._id,
          parentReferel: dt.parentReferel,
          email: dt.email,
          isActive: dt.isActive,
          fullName: dt.firstName + " " + dt.lastName,
        };
      }),
      leader: {
        id: parent?._id || 0,
        fullName: (parent.firstName || "") + " " + (parent.lastName || ""),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
