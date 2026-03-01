const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const { initializeDatabase } = require("./config/database");
const { initializeSocket } = require("./services/socketService");
const errorHandler = require("./middlewares/errorHandler");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const fuelRoutes = require("./routes/fuelRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const exitRequestRoutes = require("./routes/exitRequestRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Haramaya Fleet Management System is running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/exit-requests", exitRequestRoutes);
app.use("/api/reports", reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize database (create tables if they don't exist)
    await initializeDatabase();

    // Initialize Socket.IO
    initializeSocket(server);

    // Start server
    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
      console.log(`✓ WebSocket server initialized`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
