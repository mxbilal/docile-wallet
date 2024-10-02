require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
var ObjectId = require("mongoose").Types.ObjectId;
const withDrawRequestsModel = require("../../payment/model/withdraw_requests");

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
      aadharNumber,
      parentReferel,
      bankDetails,
    } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
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
      aadharNumber,
      parentReferel,
      bankDetails,
    });

    res.status(201).json({
      success: true,
      message: "user registered successfully",
      user: {
        docileId: newUser._id,
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
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both phone number and password",
    });
  }

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid phone number or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });

    const direct = await User.find({ "parentReferel.parentId": user._id });
    const parent = user.parentReferel.parentId
      ? await User.findOne({
          _id: new ObjectId(user.parentReferel.parentId),
        })
      : {};

    res.status(200).json({
      success: true,
      token,
      user: {
        docileId: user._id,
        email: user.email,
        isActivePartner: user.isActivePartner,
        fullName: user.firstName + " " + user.lastName,
        parent: user.parentReferel,
        docileWallet: user.walletAmount,
        referralBonus: user.referelBonus,
        phoneNumber: user?.phoneNumber,
      },
      directPartners: direct.map((dt) => {
        return {
          docileId: dt._id,
          parentReferel: dt.parentReferel,
          email: dt.email,
          isActivePartner: dt.isActivePartner,
          fullName: dt.firstName + " " + dt.lastName,
          phoneNumber: dt.phoneNumber,
        };
      }),
      leader: {
        docileId: parent?._id || 0,
        fullName: (parent?.firstName || "") + " " + (parent?.lastName || ""),
        phoneNumber: parent?.phoneNumber,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.rootRegister = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      bankDetails,
    } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
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
      bankDetails,
    });

    res.status(201).json({
      success: true,
      message: "root user registered successfully",
      user: {
        docileId: newUser._id,
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

exports.getRootUsers = async (req, res) => {
  try {
    const users = await User.find({ "parentReferel.parentId": null });
    res.status(200).json({
      success: true,
      users: users.map((user) => {
        return {
          docileId: user._id,
          email: user.email,
          fullName: user.bankDetails.fullName,
          phoneNumber: user.phoneNumber,
          isActivePartner: user.isActivePartner,
        };
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.userDetail = async (req, res) => {
  try {
    const { user_id } = req?.user;

    const user = await User.findOne({ _id: user_id });
    const direct = await User.find({ "parentReferel.parentId": user_id });
    const parent = user.parentReferel.parentId
      ? await User.findOne({
          _id: new ObjectId(user.parentReferel.parentId),
        })
      : {};

    const inProgressWithDraws = await withDrawRequestsModel?.find({
      user_id: user?._id,
      status: "in-progress",
    });

    res.status(200).json({
      success: true,
      user: {
        docileId: user._id,
        email: user.email,
        isActivePartner: user.isActivePartner,
        fullName: user.firstName + " " + user.lastName,
        docileWallet: user.walletAmount,
        firstName: user.firstName,
        lastName: user.lastName,
        referralBonus: user.referelBonus,
        phoneNumber: user.phoneNumber,
        aadharNumber: user?.aadharNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
      },
      bankDetails: user.bankDetails,
      directPartners: direct.map((dt) => {
        return {
          docileId: dt._id,
          parentReferel: dt.parentReferel,
          email: dt.email,
          isActivePartner: dt.isActivePartner,
          fullName: dt.firstName + " " + dt.lastName,
          phoneNumber: dt.phoneNumber,
        };
      }),
      leader: {
        docileId: parent?._id || 0,
        fullName: (parent?.firstName || "") + " " + (parent?.lastName || ""),
        phoneNumber: parent?.phoneNumber,
      },
      in_progress_with_draws: inProgressWithDraws?.length
        ? inProgressWithDraws.reduce(function (acc, obj) {
            return acc + obj.amount;
          }, 0)
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { user_id } = req?.user;
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      aadharNumber,
      bankDetails,
    } = req.body;

    const updateObj = {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      aadharNumber,
      bankDetails,
    };
    const updatedUser = await User.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: updateObj }
    );
    res.status(200).send({ success: true, message: "profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
