const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  itemCode: { type: String, unique: true }, // Item Code should be unique
  productPicture: String,
  productName: String,
  mrpInInr: String,
  discountedPrice: String,
  priceInInr: String,
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
