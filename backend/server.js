const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const createApp = require("./src/app");

dotenv.config({ path: path.join(__dirname, ".env") });

connectDB();

const app = createApp();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SmartCare Hospital Management System API running on port ${PORT}`);
});