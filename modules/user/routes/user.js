const express = require("express");
const router = express.Router();
const {
  login,
  register,
  rootRegister,
  getRootUsers,
  userDetail,
  updateProfile,
  searchUser,
  changePassword,
} = require("../controller/user");
const { authenticateToken } = require("../../../middlewares/authenticate");

router.post("/login", login);
router.post("/register", register);
router.post("/search-user", searchUser);
router.post("/change-password", changePassword);
router.post("/root-register", rootRegister);
router.get("/root-users", getRootUsers);

router.use("", authenticateToken);
router.get("", userDetail);
router.patch("", updateProfile);

module.exports = router;
