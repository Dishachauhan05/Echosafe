const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 8000;
const cors = require("cors");

const reportRouter = require("./routes/report");


app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(cors({
  origin: "http://10.31.8.10:5173", // React frontend IP
  credentials: true
}));

mongoose.connect("mongodb://localhost:27017/echosafe")
.then(()=>console.log("MongoDB connected!"));

app.get("/", (req, res) => {
  return res.send("Hello from EchoSafe backend!");
});

app.use("/report",reportRouter);

app.listen(8000, '0.0.0.0', () => {
  console.log("Server running on port 8000");
});
