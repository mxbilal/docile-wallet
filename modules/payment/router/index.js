const express = require("express");
const router = express.Router();
const { createOrder, razorpayCallback, getPayment } = require("../contoller");
const { authenticateToken } = require("../../../middlewares/authenticate");

router.use("/order", authenticateToken);
router.post("/order", createOrder);

router.get("/order", getPayment);

router.post("/callback", razorpayCallback);

module.exports = router;
