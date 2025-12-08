import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import cors from "cors";

// CORS + Cookies FIX

 // <-- add this
dotenv.config();

import connectDb from "./config/db.js";

// Routes
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";          
import trackedRoute from "./routes/trackedRoute.js";
import alertRoute from "./routes/alertRoute.js";




import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

connectDb();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser()); 
app.use(
  cors({
    origin: "http://localhost:3000",  // your frontend URL
    credentials: true,                // allow cookies
  })
);// <-- FIX: Add this BEFORE your routes

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/products", productRoute);
app.use("/api/users", userRoute);
app.use("/api/tracked", trackedRoute);
app.use("/api/alerts", alertRoute);


app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server running on port ${port}`));
