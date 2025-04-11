import { encryptJSON } from '../encryption'; 


const spotlight = document.getElementById("spotlight");
if (spotlight) {
    document.addEventListener("mousemove", (event) => {
        const spotlightSize = spotlight.offsetWidth;
        const halfSize = spotlightSize / 2;

        spotlight.style.left = `${event.clientX - halfSize}px`;
        spotlight.style.top = `${event.clientY - halfSize}px`;
        spotlight.style.opacity = 1;
    });
}


const createBtn = document.getElementById("create-btn");
if (createBtn) {
    createBtn.addEventListener("click", async () => {
        const roomid = document.getElementById("c-roomid").value;
        const pass = document.getElementById("c-pass").value;

        if (!roomid || !pass) {
            alert("Enter Room ID and Password!");
            return;
        }

        const cred = {
            roomid: roomid,
            password: pass
        }
        const token = encryptJSON(cred);

        const response = await fetch("https://whatthefile.onrender.com/checkroom", {
            method: "POST",
            headers: {
                token
            }
        });
        const data = await response.json();
        console.log(data);


        if (data.msg == "NOT FOUND") {
            console.log("Redirecting to:", `/createroom?token=${token}`);
            window.location.href = `/createroom/${encodeURIComponent(token)}`;
        }
        else {
            console.log("alert showed");
            alert("ROOM ALREADY EXISTS!!");
        }

    });
}


const joinbtn = document.getElementById("join-btn");
if (joinbtn) {
    joinbtn.addEventListener("click", async () => {
        const roomid = document.getElementById("j-roomid").value;
        const pass = document.getElementById("j-pass").value;
        
        const cred = {
            roomid: roomid,
            password: pass
        }
        const token = encryptJSON(cred);

        const response = await fetch("https://whatthefile.onrender.com/checkroom", {
            method: "POST",
            headers: {
                token
            }
        });
        const data = await response.json();
        console.log(data);


        if (data.msg == "FOUND") {
            window.location.href = `/joinroom/${encodeURIComponent(token)}`;
        }
        else {
            console.log("alert showed");
            alert("Invalid RoomId or Password");
        }
    });
}