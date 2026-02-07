require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* =======================
   GLOBAL MIDDLEWARES
======================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   STATIC FILES
======================= */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* =======================
   ROUTES
======================= */
app.use("/clients", require("./routes/client.routes"));
app.use("/users", require("./routes/user.routes"));

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || "Internal Server Error"
  });
});


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "client-management-api",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    staticMessage:"Deployed on 23 Jan 3:50 PM"
  });
});

/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
