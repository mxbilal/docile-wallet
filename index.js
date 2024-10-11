const express = require("express"),
  cors = require("cors"),
  app = express(),
  bodyParser = require("body-parser"),
  dbConnect = require("./config/db");

const userRoute = require("./modules/user/routes/user");
const paymentRoute = require("./modules/payment/router");
const User = require("./modules/user/models/userModel");
const { addbonus } = require("./modules/payment/contoller");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

dbConnect();
app.use(express.static("public"));
app.use("/user", userRoute);
app.use("/payment", paymentRoute);

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
});

app.use("/addbonus/:id", addbonus);
