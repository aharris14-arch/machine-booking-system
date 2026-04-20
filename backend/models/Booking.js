const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: String,
  machine: String,
  location: String,
  date: String,
  timeSlot: String,
});

module.exports = mongoose.model("Booking", BookingSchema);