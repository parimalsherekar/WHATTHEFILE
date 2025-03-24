

document.addEventListener('DOMContentLoaded', () => {
    const spotlight = document.getElementById('spotlight');
  
    if (spotlight) {
      document.addEventListener('mousemove', (event) => {
        const spotlightSize = spotlight.offsetWidth; // Get actual size from CSS
        const halfSize = spotlightSize / 2;
  
        spotlight.style.left = `${event.clientX - halfSize}px`;
        spotlight.style.top = `${event.clientY - halfSize}px`;
        spotlight.style.opacity = 1;
      });
    } else {
      console.error("Element with id 'spotlight' not found.");
    }
  });
  

document.getElementById("create-btn").addEventListener("click",async()=>{
  const roomid = document.getElementById("c-roomid").value;
  const pass = document.getElementById("c-pass").value;

  const response = await fetch("http://localhost:3000/createroom",{
    method : "GET",
    headers :{
      roomid :roomid,
      password :pass,
    }
  });

  const data = await response.json();

  alert(data);

});
