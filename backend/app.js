const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const errorHandler = require("./src/middlewares/errorHandler");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "AIFA Backend Running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "backend",
  });
});

// Routes
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/user", require("./src/routes/user.routes"));
app.use("/api/expense", require("./src/routes/expense.routes"));
app.use("/api/gpay", require("./src/routes/gpay.routes"));
app.use("/api/analytics", require("./src/routes/analytics.routes"));
app.use("/api/transaction", require("./src/routes/transaction.routes"));
app.use("/api/chat", require("./src/routes/chat.routes"));
app.use("/api/notifications", require("./src/routes/notification.routes"));
app.use("/api/reports", require("./src/routes/report.routes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler (MUST be last)
app.use(errorHandler);

module.exports = app;