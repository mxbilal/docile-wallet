const express = require("express");
const router = express.Router();
const { createOrder, razorpayCallback } = require("../contoller")
const { authenticateToken } = require("../../../middlewares/authenticate")

router.use("/order", authenticateToken);
router.post("/order", createOrder);

router.post("/callback", razorpayCallback);

module.exports = router;
