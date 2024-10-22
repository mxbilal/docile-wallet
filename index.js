const express = require("express"),
  cors = require("cors"),
  app = express(),
  bodyParser = require("body-parser"),
  dbConnect = require("./config/db");

const userRoute = require("./modules/user/routes/user");
const paymentRoute = require("./modules/payment/router");
const multer = require("multer");
const XLSX = require("xlsx");
const Product = require("./modules/products/model");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

dbConnect();
app.use(express.static("public"));
app.use("/user", userRoute);
app.use("/payment", paymentRoute);

const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file.path;

    // Read the Excel file
    const workbook = XLSX.readFile(file);
    const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
    const options = { header: 1, range: 1 }; // `header: 1` treats first row as headers, `range: 1` starts from the second row

    // Convert the sheet data to JSON format, skipping the first row (headers)
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], options);

    // Process each product starting from the second row
    // console.log(rawData)
    // return
    const bulkOps = rawData.map((row) => {
      return {
        updateOne: {
          filter: { itemCode: row[0] }, // Assuming Item Code is in the first column (A)
          update: {
            productPicture: row[1], // B2 (Product Picture)
            productName: row[2], // C2 (Product Name)
            mrpInInr: row[3], // D2 (MRP in INR)
            discountedPrice: row[4], // E2 (Discounted Price in INR)
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
});
app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
});
