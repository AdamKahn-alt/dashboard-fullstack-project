import express from "express";
import dotenv from "dotenv";
import userRoute from "./src/routes/userRoute.js";
import adminRoute from "./src/routes/adminRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config({
  path: "./.env",
});
const app = express();
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ["http://localhost:5500", "http://127.0.0.1:5500"];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/api/v1/users", userRoute);
app.use("/api/v1/users", adminRoute);

export default app;
