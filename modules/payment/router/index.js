const express = require("express");
const router = express.Router();
const { createOrder, razorpayCallback } = require("../contoller")

router.post("/order", createOrder);
router.post("/callback", razorpayCallback);

module.exports = router;
