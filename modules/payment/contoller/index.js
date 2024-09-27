require("dotenv").config();
const Razorpay = require("razorpay");
const PaymentModel = require("../model");
var ObjectId = require("mongoose").Types.ObjectId;
const userModel = require("../../user/models/userModel");
const {
  validatePaymentVerification,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../../user/models/userModel");
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const payStatus = { created: "Pending", captured: "Paid" };
exports.createOrder = async (req, res) => {
  try {
    const { user_id } = req?.user;
    const order = await instance.orders.create({
      amount: 900,
      currency: "INR",
      receipt: "receipt#1",
      partial_payment: false,
      notes: {
        key1: "value3",
        key2: "value2",
      },
    });

    await PaymentModel.create({ order, user_id });
    return res.status(200).send({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.razorpayCallback = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      error,
    } = req?.body;
    console.log(error);
    if (error) {
      return res.redirect(process.env.ERROR_PAGE);
    }

    const userOrder = await PaymentModel.findOne({
      "order.id": razorpay_order_id,
    });

    console.log(userOrder);

    if (!userOrder) {
      return res.redirect(process.env.ERROR_PAGE);
    }

    const paymentValidate = await validatePaymentVerification(
      { order_id: userOrder?.order?.id, payment_id: razorpay_payment_id },
      razorpay_signature,
      process.env.RAZORPAY_SECRET
    );
    if (!paymentValidate) {
      return res.redirect(process.env.ERROR_PAGE);
    }

    console.log("paymentValidate", paymentValidate);

    const fetchPayment = await instance.payments.fetch(razorpay_payment_id);
    console.log("fetchPayment", fetchPayment);

    await PaymentModel.updateOne(
      { "order.id": userOrder?.order?.id },
      {
        $set: {
          "order.status": fetchPayment?.status,
          razorpay_payment_id,
        },
      }
    );``

    const user = await userModel.findOneAndUpdate(
      { _id: new ObjectId(userOrder?.user_id) },
      { $set: { walletAmount: 16500, isActivePartner: true } },
      {
        returnDocument: "after",
        returnNewDocument: true,
      }
    );

    if (user?.parentReferel?.parentId) {
      const parentReferel = await userModel.findOne({
        _id: new ObjectId(user?.parentReferel?.parentId),
      });
      let updateParent = {};
      if (parentReferel?.bonusCount === 0) {
        updateParent = {
          bonusCount: 1,
          referelBonus: 5000,
        };
      } else if (parentReferel?.bonusCount === 1) {
        updateParent = {
          bonusCount: 2,
          referelBonus: 13000,
        };
      }

      await userModel.updateOne(
        { _id: new ObjectId(parentReferel?._id) },
        { $set: updateParent }
      );
    }

    return res.redirect(process.env.SUCCESS_PAGE);
  } catch (err) {
    console.error(err);
    res.redirect(process.env.ERROR_PAGE);
  }
};

exports.getPayment = async (req, res) => {
  try {
    // Retrieve all payments and populate the associated user's data
    const payments = await PaymentModel.find().populate(
      "user_id",
      "email bankDetails.fullName phoneNumber"
    );

    // Format the payments to include user info and order details
    const formattedPayments = payments.map((payment) => {
      const user = payment.user_id; // This should now contain full user details

      return {
        userInfo: {
          docileId: user._id,
          email: user.email,
          fullName: user?.bankDetails?.fullName || "N/A", // Handle cases where bankDetails might not exist
          phoneNumber: user.phoneNumber,
        },
        order: {
          amount: (payment?.order?.amount || 0) / 100,
          time: payment?.updatedAt,
          status: payment?.order
            ? payStatus[payment?.order?.status] || "Failed"
            : "No order",
        },
      };
    });

    res.status(200).json({ result: formattedPayments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
