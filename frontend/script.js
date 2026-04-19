const API = "https://machine-booking-system.onrender.com/api";

// REGISTER
function register(){
  const msg = document.getElementById("message");

  if(!name.value || !email.value || !password.value || !location.value){
    msg.innerHTML = "<p class='error'>All fields required</p>";
    return;
  }

  fetch(API+"/auth/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      name:name.value,
      email:email.value,
      password:password.value,
      location:location.value
    })
  })
  .then(res=>res.json())
  .then(()=>{
    msg.innerHTML = "<p class='success'>Registered! Redirecting...</p>";
    setTimeout(()=> window.location="login.html",1500);
  })
  .catch(()=> msg.innerHTML="<p class='error'>Error</p>");
}

// LOGIN
function login(){
  const msg = document.getElementById("message");

  fetch(API+"/auth/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email:email.value,
      password:password.value
    })
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.token){
      localStorage.setItem("token",data.token);
      localStorage.setItem("location",data.location);

      if(data.role==="admin"){
        window.location="admin.html";
      } else {
        window.location="dashboard.html";
      }
    } else {
      msg.innerHTML = `<p class='error'>${data.msg}</p>`;
    }
  });
}

// LOGOUT
function logout(){
  localStorage.clear();
  window.location = "login.html";
}

// BOOK
function book(){
  const msg = document.getElementById("message");

  const data = {
    machine: machine.value,
    location: localStorage.getItem("location"),
    date: date.value,
    startTime: startTime.value,
    endTime: endTime.value
  };

  if(!data.machine || !data.date || !data.startTime){
    msg.innerHTML = "<p class='error'>Fill all fields</p>";
    return;
  }

  fetch(API+"/bookings",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": localStorage.getItem("token")
    },
    body:JSON.stringify(data)
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.msg==="Booked"){
      msg.innerHTML = "<p class='success'>Booked</p>";
      loadBookings();
    } else {
      msg.innerHTML = `<p class='error'>${data.msg}</p>`;
    }
  });
}

// LOAD BOOKINGS
function loadBookings(){
  fetch(API+"/bookings",{
    headers:{Authorization:localStorage.getItem("token")}
  })
  .then(res=>res.json())
  .then(data=>{
    bookings.innerHTML = data.map(b=>`
      <div class="card">
        ${b.machine} - ${b.date} ${b.startTime}
        <button onclick="cancelBooking('${b._id}')">Cancel</button>
      </div>
    `).join("");
  });
}

// CANCEL
function cancelBooking(id){
  fetch(API+"/bookings/"+id,{
    method:"DELETE",
    headers:{Authorization:localStorage.getItem("token")}
  })
  .then(res=>res.json())
  .then(data=>{
    alert(data.msg);
    loadBookings();
  });
}

// ADMIN DELETE
function deleteBooking(id){
  fetch(API+"/bookings/"+id,{
    method:"DELETE",
    headers:{Authorization:localStorage.getItem("token")}
  })
  .then(()=> loadAll());
}