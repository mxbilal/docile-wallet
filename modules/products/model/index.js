const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  itemCode: { type: String, unique: true }, // Item Code should be unique
  productPicture: String,
  productName: String,
  mrpInInr: Number,
  discountedPrice: Number,
  priceInInr: Number,
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
