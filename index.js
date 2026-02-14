import dotenv from "dotenv";
dotenv.config();

import express from "express";
// import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import userRoute from "./Router/user-routes.js";
import { redisSetup } from "./config/redis.js";
import logger from "./config/logger.js";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";
import { setupSwagger } from "./swagger/swagger.js";

const app = express();

const NODE_ENV = process.env.NODE_ENV || "development";

// restrict to my dev origin
const AllowedOrigins = [
  process.env.ORIGIN_LOCAL,
  process.env.ORIGIN_VERCEL,
  process.env.ORIGIN_HOSTED_FRONTEND,
].filter(Boolean); // Remove empty values

//Middleware
app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); //mobile apps, postman
      if (AllowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not Allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

//Create Redis client
await redisSetup();

app.use("/api/", limiter);

app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.set("query parser", "extended");

// app.use(
//   mongoSanitize({
//     replaceWith: "_",
//     allowDots: true,
//     onSanitize: ({ req, key }) => {
//       // optional logging
//       console.warn(`Sanitized key: ${key}`);
//     },
//   }),
// );

//Routes
app.use("/api/user", userRoute);
// app.use("/api/course", courseRoute);
// app.use("/api/cohort", cohortRoute);
app.get("/", (req, res) => {
  res.send("You have reached the backend for my MDTH project");
});

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

//  await mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.error("Error connecting to MongoDB:", err);
//     process.exit(1);
//   });

//   //start server
// app.listen(process.env.PORT, () => {
//   console.log(`Server is running on port ${process.env.PORT}`);
// });

const startServer = async () => {
  try {
    await connectDB();

    logger.info("Database connected successfully");

    app.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
// Swagger documentation
setupSwagger(app);

// LOGIC TO USE REDISCLIENT IN CONTROLLERS
// const cachedUser = await redisClient.get(`user:${user._id}`);
// if (cachedUser) {
//   res.status(200).json("Cached user:", JSON.parse(cachedUser));
// } else {
//   const user = await User.findById("69860c12a1cbf6dbe1ac5144");
//   if (user) {
//     await redisClient.set(`user:${user._id}`, JSON.stringify(user), { EX: 60 });
//   }
// }

// Basic error handler (optional but helpful)
app.use((err, req, res, next) => {
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.params);
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});
