import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import userRoute from "./Router/user-routes.js";
// import courseRoute from "./Router/course-routes.js"

const app = express();

// restrict to my dev origin
// const AllowedOrigins = [
//   process.env.ORIGIN_LOCAL,
//   process.env.ORIGIN_VERCEL,
//   process.env.ORIGIN_HOSTED_FRONTEND,
// ].filter(Boolean); // Remove empty values

//Middleware
app.use(express.json());

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true); //mobile apps, postman
//       if (AllowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         return callback(new Error("Not Allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);

//Routes
app.use("/api/user", userRoute);
// app.use("/api/course", courseRoute);
// app.use("/api/cohort", cohortRoute);
// app.use("/api/user", userRoute);
// app.use("/api/product", product);
app.get("/", (req, res) => {
  res.send("You have reached the backend for my MDTH project");
});

//start server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// Basic error handler (optional but helpful)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});
