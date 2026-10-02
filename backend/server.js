require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => res.json({ message: "Lost & Found API running" }));

// ---- Routes (each member mounts their own file here) ----
// app.use("/api/auth", require("./routes/authRoutes"));      // Member 4
// app.use("/api/items", require("./routes/itemRoutes"));     // Member 5
// app.use("/api/search", require("./routes/searchRoutes"));  // Member 6
// app.use("/api/admin", require("./routes/adminRoutes"));    // Member 7

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
