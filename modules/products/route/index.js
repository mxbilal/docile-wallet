const multer = require("multer");
const express = require("express");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const { uploadProducts, getAllProducts } = require("../controller");

router.post("/upload", upload.single("file"), uploadProducts);
router.get("/", getAllProducts);

module.exports = router;
