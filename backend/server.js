const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("DB Connected"))
.catch(err=> console.log(err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/bookings", require("./routes/booking"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket)=>{
  console.log("User connected");
});

app.set("io", io);

server.listen(5000, ()=> console.log("Server running"));