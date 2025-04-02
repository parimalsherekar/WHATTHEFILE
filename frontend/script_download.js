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

let dirHandle = null;

// Function to prompt the user to select a download directory.
// This must be called directly in response to a user gesture.
async function chooseDownloadDirectory() {
    try {
        if (!window.showDirectoryPicker) {
            alert("Your browser doesn't support the File System Access API.");
            return null;
        }

        dirHandle = await window.showDirectoryPicker();
        const permission = await dirHandle.requestPermission({ mode: "readwrite" });

        if (permission !== "granted") {
            alert("Permission to write files was denied!");
            dirHandle = null;
            return null;
        }

        alert("Download directory selected and permission granted!");
        return dirHandle;
    } catch (err) {
        console.error("Directory selection failed:", err);
        return null;
    }
}

// When user clicks download, first choose a directory if not already set.
download_card.addEventListener('click', async () => {
    if (!dirHandle) {
        dirHandle = await chooseDownloadDirectory();  // Ensure directory is chosen.
        if (!dirHandle) return; // Stop if directory selection failed.
    }
    
    prog.innerHTML = "Connecting to Sender";
    try {
        const response = await fetch("https://whatthefile.onrender.com/getlink", {
            method: "GET",
            headers: {
                roomid: roomid,
                password: password
            }
        });
        const data = await response.json();
        const magnetLink = data.msg.link;
        console.log("Magnet link:", magnetLink);

        const client = new WebTorrent();
        console.log("WebTorrent client created:", client);
        console.log("Adding torrent:", magnetLink);

        client.add(magnetLink, async (torrent) => {
            alert("Downloading: " + torrent.name);
            const file = torrent.files[0];
            console.log("Filename:", file.name);

            try {
                // Ensure directory permission is still valid
                const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
                const writable = await fileHandle.createWritable();
                const stream = file.createReadStream();

                for await (const chunk of stream) {
                    prog.innerHTML = Math.round(torrent.progress * 100) + "%";
                    await writable.write(chunk);
                }
                await writable.close();
                prog.innerHTML = "Download Completed";
                alert(`Saved: ${file.name}`);
            } catch (err) {
                console.error("File save failed:", err);
            }
        });
    } catch (err) {
        console.error("Error fetching magnet link:", err);
        alert("Failed to fetch file. Please try again.");
    }
});
