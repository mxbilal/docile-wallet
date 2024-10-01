const express = require("express");
const router = express.Router();
const { createOrder, razorpayCallback, getPayment, withDrawRequest, withDrawRequests, updateWithDrawRequest } = require("../contoller");
const { authenticateToken } = require("../../../middlewares/authenticate");

router.use("/order", authenticateToken);
router.post("/order", createOrder);

router.get("/order", getPayment);

router.use("/request", authenticateToken);
router.post("/request/withdraw", withDrawRequest);
router.get("/request/withdraws", withDrawRequests);

router.patch("/request/withdraw/:id", updateWithDrawRequest);

router.post("/callback", razorpayCallback);

module.exports = router;
