import express from "express"
import dotenv from "dotenv"

const app = express()
dotenv.config();
const PORT = process.env.PORT || 5000;


app.get("/", (req, res) => {
    res.send("Hello")

})

app.get("/api/auth/signup", (req, res) => {
    res.send("Signup")

})

app.listen(PORT, () => console.log(`Server is Running on port ${PORT}`));
