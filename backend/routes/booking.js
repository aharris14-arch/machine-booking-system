// Prevent past booking
if(new Date(date + " " + startTime) < new Date()){
  return res.status(400).json({msg:"Cannot book past time"});
}

// Ensure user books ONLY their location
if(user.location !== location){
  return res.status(400).json({msg:"Invalid location"});
}

const existing = await Booking.findOne({
  machine,
  date,
  startTime
});

if(existing){
  return res.status(400).json({msg:"Slot already booked"});
}

const bookingTime = new Date(booking.date + " " + booking.startTime);
const now = new Date();

if((bookingTime - now) < 3600000){
  return res.status(400).json({msg:"Cannot cancel within 1 hour"});
}