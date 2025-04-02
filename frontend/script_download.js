const params = new URLSearchParams(window.location.search);
const roomid = params.get("roomid");
const password = params.get("password");

document.getElementById("rn").innerHTML = roomid;
document.getElementById("rp").innerHTML = password;



const download_card = document.getElementById("dc");
const prog = document.getElementById('prog');

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

download_card.addEventListener('click', async () => {
    prog.innerHTML = "Connecting to Sender";

    const Response = await fetch("http://192.168.178.135:3000/getlink", {
        method: "GET",
        headers: {
            roomid: roomid,
            password: password
        }
    });
    const data = await Response.json();

    const magnetLink = data.msg.link;

    console.log(magnetLink);

    let dirHandle = null;
    const client = new WebTorrent();
    console.log("WebTorrent client created:", client);
    console.log("Adding torrent:", magnetLink);


    client.add(magnetLink, async (torrent) => {
        alert("Downloading:", torrent.name);

        const file = torrent.files[0];
        console.log("Filename:", file.name);

        try {
            dirHandle = await window.showDirectoryPicker();
            const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
            const writable = await fileHandle.createWritable();

            const stream = file.createReadStream();


            for await (const chunk of stream) {
                prog.innerHTML = Math.round(torrent.progress * 100) + "%";
                await writable.write(chunk);
            }

            await writable.close();
            prog.innerHTML = "Download Completed";
            alert(`Saved : ${file.name}`);
        } catch (err) {
            console.error("File save failed:", err);
        }
    });
});