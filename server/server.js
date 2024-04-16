dotenv.config();
import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import connectDb from "./db/connectDB.js";

const app = express()
const PORT = process.env.PORT || 5000;


app.use(express.json());    //middleware

app.use("/api/auth", authRoutes);



app.listen(PORT, async () => {
    console.log(`Server is Running on port ${PORT}`)
    connectDb();
});
