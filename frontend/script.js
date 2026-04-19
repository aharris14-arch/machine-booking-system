const API = "https://YOUR-RENDER-URL.onrender.com/api";

function register(){
  const data = {
    name: name.value,
    email: email.value,
    password: password.value,
    location: location.value
  };

  fetch(API+"/auth/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  })
  .then(res=>res.json())
  .then(()=> window.location="login.html");
}

function login(){
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
    localStorage.setItem("token",data.token);
    window.location="dashboard.html";
  });
}