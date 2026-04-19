const router = require("express").Router();
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");

// CREATE BOOKING
router.post("/", auth, async(req,res)=>{
  const {machine,location,date,startTime,endTime} = req.body;

  // ✅ Prevent past booking
  if(new Date(date + " " + startTime) < new Date()){
    return res.status(400).json({msg:"Cannot book past time"});
  }

  // ✅ Location restriction
  if(req.user.location !== location){
    return res.status(400).json({msg:"Wrong location"});
  }

  // ✅ Machine restriction
  const allowedMachines = location === "Units"
    ? ["Machine1","Machine2"]
    : ["Machine3","Machine4"];

  if(!allowedMachines.includes(machine)){
    return res.status(400).json({msg:"Invalid machine"});
  }

  // ✅ Prevent double booking
  const exists = await Booking.findOne({machine,date,startTime});
  if(exists){
    return res.status(400).json({msg:"Slot already booked"});
  }

  const booking = new Booking({
    userId: req.user.id,
    machine,
    location,
    date,
    startTime,
    endTime
  });

  await booking.save();

  console.log("Notification: Booking confirmed");

  res.json({msg:"Booked"});
});

// GET BOOKINGS
router.get("/", auth, async(req,res)=>{
  const bookings = await Booking.find({location:req.user.location});
  res.json(bookings);
});

// CANCEL BOOKING
router.delete("/:id", auth, async(req,res)=>{
  const booking = await Booking.findById(req.params.id);

  const bookingTime = new Date(booking.date + " " + booking.startTime);

  if((bookingTime - new Date()) < 3600000){
    return res.status(400).json({msg:"Cannot cancel within 1 hour"});
  }

  await booking.deleteOne();
  res.json({msg:"Cancelled"});
});

module.exports = router;