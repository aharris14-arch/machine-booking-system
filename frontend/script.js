const API = "https://machine-booking-system.onrender.com/api";


// =====================
// REGISTER
// =====================
function register(){
  const msg = document.getElementById("message");

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const location = document.getElementById("location").value;

  if(!name || !email || !password || !location){
    msg.innerHTML = "<p class='error'>All fields required</p>";
    return;
  }

  fetch(API + "/auth/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ name, email, password, location })
  })
  .then(res => res.json())
  .then(data => {
    if(data.msg === "Registered"){
      msg.innerHTML = "<p class='success'>Registered! Redirecting...</p>";
      setTimeout(()=> window.location="login.html",1500);
    } else {
      msg.innerHTML = `<p class='error'>${data.msg}</p>`;
    }
  })
  .catch(()=>{
    msg.innerHTML = "<p class='error'>Server error</p>";
  });
}


// =====================
// LOGIN
// =====================
function login(){
  const msg = document.getElementById("message");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!email || !password){
    msg.innerHTML = "<p class='error'>Enter all fields</p>";
    return;
  }

  fetch(API + "/auth/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if(data.token){
      localStorage.setItem("token", data.token);
      localStorage.setItem("location", data.location);

      if(data.role === "admin"){
        window.location = "admin.html";
      } else {
        window.location = "dashboard.html";
      }
    } else {
      msg.innerHTML = `<p class='error'>${data.msg}</p>`;
    }
  })
  .catch(()=>{
    msg.innerHTML = "<p class='error'>Server error</p>";
  });
}


// =====================
// LOGOUT
// =====================
function logout(){
  localStorage.clear();
  window.location = "login.html";
}


// =====================
// BOOK MACHINE
// =====================
function book(){
  const msg = document.getElementById("message");

  const machine = document.getElementById("machine").value;
  const date = document.getElementById("date").value;
  const timeSlot = document.getElementById("timeSlot").value;
  const location = localStorage.getItem("location");

  if(!machine || !date || !timeSlot){
    msg.innerHTML = "<p class='error'>Fill all fields</p>";
    return;
  }

  fetch(API + "/bookings",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({
      machine,
      date,
      timeSlot,
      location
    })
  })
  .then(res => res.json())
  .then(data => {
    if(data.msg === "Booked"){
      msg.innerHTML = "<p class='success'>Booking successful</p>";
      loadBookings();
    } else {
      msg.innerHTML = `<p class='error'>${data.msg}</p>`;
    }
  })
  .catch(()=>{
    msg.innerHTML = "<p class='error'>Server error</p>";
  });
}


// =====================
// LOAD BOOKINGS
// =====================
function loadBookings(){
  fetch(API + "/bookings",{
    headers:{
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {
    const bookingsDiv = document.getElementById("bookings");

    bookingsDiv.innerHTML = data.map(b => `
      <div class="card">
        <strong>${b.machine}</strong><br>
        ${b.date} | ${b.timeSlot}<br>
        <button onclick="cancelBooking('${b._id}')">Cancel</button>
      </div>
    `).join("");
  });
}


// =====================
// CANCEL BOOKING
// =====================
function cancelBooking(id){
  fetch(API + "/bookings/" + id,{
    method:"DELETE",
    headers:{
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {
    alert(data.msg);
    loadBookings();
  });
}


// =====================
// ADMIN DELETE
// =====================
function deleteBooking(id){
  fetch(API + "/bookings/" + id,{
    method:"DELETE",
    headers:{
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(()=> loadAll());
}