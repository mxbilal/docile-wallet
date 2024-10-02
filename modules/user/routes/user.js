const express = require("express");
const router = express.Router();
const {
  login,
  register,
  rootRegister,
  getRootUsers,
  userDetail,
  updateProfile
} = require("../controller/user");
const { authenticateToken } = require("../../../middlewares/authenticate");

router.post("/login", login);
router.post("/register", register);
router.post("/root-register", rootRegister);
router.get("/root-users", getRootUsers);

router.use("", authenticateToken);
router.get("", userDetail);
router.patch("", updateProfile);


module.exports = router;
