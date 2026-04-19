const router = require("express").Router();
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// CREATE
router.post("/", auth, async(req,res)=>{
  const {machine,location,date,startTime,endTime} = req.body;

  if(new Date(date+" "+startTime) < new Date()){
    return res.status(400).json({msg:"Past time"});
  }

  if(req.user.location !== location){
    return res.status(400).json({msg:"Wrong location"});
  }

  const allowed = location === "Units"
    ? ["Machine1","Machine2"]
    : ["Machine3","Machine4"];

  if(!allowed.includes(machine)){
    return res.status(400).json({msg:"Invalid machine"});
  }

  const exists = await Booking.findOne({machine,date,startTime});
  if(exists){
    return res.status(400).json({msg:"Slot taken"});
  }

  const booking = new Booking({
    userId:req.user.id,
    machine,location,date,startTime,endTime
  });

  await booking.save();

  req.app.get("io").emit("bookingUpdated");

  res.json({msg:"Booked"});
});

// GET USER BOOKINGS
router.get("/", auth, async(req,res)=>{
  const data = await Booking.find({location:req.user.location});
  res.json(data);
});

// ADMIN: GET ALL
router.get("/all", auth, admin, async(req,res)=>{
  const data = await Booking.find();
  res.json(data);
});

// ANALYTICS
router.get("/analytics", auth, admin, async(req,res)=>{
  const bookings = await Booking.find();

  const machineUsage = {};
  const peakHours = {};

  bookings.forEach(b=>{
    machineUsage[b.machine] = (machineUsage[b.machine]||0)+1;
    const hour = b.startTime.split(":")[0];
    peakHours[hour] = (peakHours[hour]||0)+1;
  });

  res.json({
    total: bookings.length,
    machineUsage,
    peakHours
  });
});

// DELETE
router.delete("/:id", auth, async(req,res)=>{
  const booking = await Booking.findById(req.params.id);

  const time = new Date(booking.date+" "+booking.startTime);
  if((time - new Date()) < 3600000){
    return res.status(400).json({msg:"Too late to cancel"});
  }

  await booking.deleteOne();

  req.app.get("io").emit("bookingUpdated");

  res.json({msg:"Cancelled"});
});

module.exports = router;