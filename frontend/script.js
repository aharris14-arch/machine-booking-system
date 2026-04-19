fetch("https://machine-booking-system.onrender.com/api/bookings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
})