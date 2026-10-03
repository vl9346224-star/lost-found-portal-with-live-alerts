// Usage: npm run create-admin -- admin@college.edu Admin@123 "Admin Name"
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  const [email, password, name = "Admin"] = process.argv.slice(2);
  if (!email || !password) {
    console.log('Usage: npm run create-admin -- <email> <password> "<name>"');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    user.role = "admin";
    user.password = password;
    await user.save();
    console.log(`Existing user promoted to admin: ${email}`);
  } else {
    await User.create({ name, email, password, role: "admin" });
    console.log(`Admin created: ${email}`);
  }
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
