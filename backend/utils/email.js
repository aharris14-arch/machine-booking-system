const nodemailer = require("nodemailer");

// ======================
// EMAIL TRANSPORTER
// ======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// ======================
// SEND BOOKING EMAIL
// ======================
async function sendBookingEmail(userEmail, booking) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Machine Booking Confirmation",
      html: `
        <h2>Booking Confirmed</h2>
        <p>Your machine booking is confirmed.</p>
        <br>
        <b>Machine:</b> ${booking.machine}<br>
        <b>Location:</b> ${booking.location}<br>
        <b>Date:</b> ${booking.date}<br>
        <b>Time Slot:</b> ${booking.timeSlot}<br>
        <br>
        <p>Please arrive on time.</p>
      `
    });

    console.log("Email sent");
  } catch (err) {
    console.log("Email error:", err);
  }
}

module.exports = { sendBookingEmail };