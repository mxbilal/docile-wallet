require("dotenv").config();
const XLSX = require("xlsx");
const Product = require("../model");

exports.uploadProducts = async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
    const options = { header: 1, range: 1 }; // `header: 1` treats first row as headers, `range: 1` starts from the second row

    // Convert the sheet data to JSON format, skipping the first row (headers)
    const rawData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName],
      options
    );
    const bulkOps = rawData.map((row) => {
      return {
        updateOne: {
          filter: { itemCode: row[1] }, // Assuming Item Code is in the first column (A)
          update: {
            productPicture: row[0], // B2 (Product Picture)
            productName: row[2], // C2 (Product Name)
            weight: row[3],
            mrpInInr: row[4], // D2 (MRP in INR)
            discountedPrice: row[5], // E2 (Discounted Price in INR)
            cash_back: row[6],
            status: row[7],
            priceInInr: 10, // F2 (Price in INR)
          },
          upsert: true, // Insert if no matching product
        },
      };
    });
    await Product.bulkWrite(bulkOps);

    res.status(200).json({ message: "Products successfully inserted/updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing file" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { page_no, search } = req.query;
    let filter = {};
    if(search) {
      filter = {
        $or: [
          { itemCode: { $regex: search, $options: 'i' } },
          { productName: { $regex: search, $options: 'i' } }
        ]
      }
    }
    let pageNo = page_no;
    let perPage = parseInt(process.env.PAGINATION_PER_PAGE);

    const total_products = await Product.countDocuments(filter);
    if (!page_no) {
      pageNo = 1;
      perPage = total_products;
    }

    const products = await Product.find(filter)
      .limit(perPage)
      .skip(perPage * (pageNo - 1))
      .sort({ createdAt: -1 });

    return res.status(200).send({ success: true, products, total_products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { item_code } = req?.params;
    const {
      productPicture,   
      weight,
      mrpInInr, 
      discountedPrice, 
      cash_back,
      status,
      priceInInr
    } = req.body;

    const updateObj = {
      productPicture,   
      weight,
      mrpInInr, 
      discountedPrice, 
      cash_back,
      status,
      priceInInr
    };
    await Product.updateOne(
      { itemCode: item_code },
      { $set: updateObj }
    );
    res.status(200).send({ success: true, message: "product updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};