const multer = require("multer");
const express = require("express");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const { uploadProducts, getAllProducts, updateProduct } = require("../controller");

router.post("/upload", upload.single("file"), uploadProducts);
router.get("/", getAllProducts);
router.patch("/:item_code", updateProduct);

module.exports = router;
