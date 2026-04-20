const router = require("express").Router();
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


// ======================
// CREATE BOOKING
// ======================
router.post("/", auth, async (req, res) => {
  try {
    const { machine, location, date, startTime, endTime } = req.body;

    // ✅ validate inputs
    if (!machine || !location || !date || !startTime || !endTime) {
      return res.status(400).json({ msg: "All fields required" });
    }

    // ❌ prevent past booking
const bookingTime = new Date(date + "T" + startTime + ":00Z");
const now = new Date();

if (bookingTime <= now) {
  return res.status(400).json({ msg: "Cannot book past time" });
}

    // 🔒 FORCE correct user location (security fix)
    if (location !== req.user.location) {
      return res.status(400).json({ msg: "Invalid location access" });
    }

    // 🏠 MACHINE RULES (STRICT ENFORCEMENT)
    const unitMachines = ["Units 1", "Units 2"];
    const blockMachines = ["Blocks 1", "Blocks 2"];

    let allowedMachines = [];

    if (req.user.location === "Units") {
      allowedMachines = unitMachines;
    } else if (req.user.location === "Blocks") {
      allowedMachines = blockMachines;
    } else {
      return res.status(400).json({ msg: "Invalid user location" });
    }

    if (!allowedMachines.includes(machine)) {
      return res.status(400).json({ msg: "Machine not allowed for your location" });
    }

    // ❌ prevent double booking
    const exists = await Booking.findOne({ machine, date, startTime });
    if (exists) {
      return res.status(400).json({ msg: "Slot already taken" });
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

    req.app.get("io").emit("bookingUpdated");

    res.json({ msg: "Booked" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// ======================
// GET USER BOOKINGS
// ======================
router.get("/", auth, async (req, res) => {
  try {
    const data = await Booking.find({ location: req.user.location });
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


// ======================
// ADMIN: ALL BOOKINGS
// ======================
router.get("/all", auth, admin, async (req, res) => {
  try {
    const data = await Booking.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


// ======================
// ANALYTICS
// ======================
router.get("/analytics", auth, admin, async (req, res) => {
  try {
    const bookings = await Booking.find();

    const machineUsage = {};
    const peakHours = {};

    bookings.forEach(b => {
      machineUsage[b.machine] = (machineUsage[b.machine] || 0) + 1;

      const hour = b.startTime.split(":")[0];
      peakHours[hour] = (peakHours[hour] || 0) + 1;
    });

    res.json({
      total: bookings.length,
      machineUsage,
      peakHours
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


// ======================
// DELETE BOOKING
// ======================
router.delete("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    const bookingTime = new Date(`${booking.date} ${booking.startTime}`);

    // ⏱ only allow cancel 1 hour before
    if ((bookingTime - new Date()) < 3600000) {
      return res.status(400).json({ msg: "Too late to cancel (1hr rule)" });
    }

    await booking.deleteOne();

    req.app.get("io").emit("bookingUpdated");

    res.json({ msg: "Cancelled" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;