const API = "https://machine-booking-system.onrender.com/api";

// REGISTER
function register(){
  const msg = document.getElementById("message");

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const locationEl = document.getElementById("location");

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();
  const location = locationEl.value;

  // DEBUG (REMOVE LATER)
  console.log(name, email, password, location);

  if(!name || !email || !password || !location){
    msg.innerHTML = "<p class='error'>All fields required</p>";
    return;
  }

  fetch(API + "/auth/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      name,
      email,
      password,
      location
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data);

    if(data.msg === "Registered"){
      msg.innerHTML = "<p class='success'>Registered! Redirecting...</p>";
      setTimeout(()=> window.location="login.html",1500);
    } else {
      msg.innerHTML = `<p class='error'>${data.msg || "Error"}</p>`;
    }
  })
  .catch(err=>{
    console.log(err);
    msg.innerHTML = "<p class='error'>Server error</p>";
  });
}


// LOGIN
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
    console.log(data);

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


// LOGOUT
function logout(){
  localStorage.clear();
  window.location = "login.html";
}