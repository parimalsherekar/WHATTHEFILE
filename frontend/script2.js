const params = new URLSearchParams(window.location.search);
const roomid = params.get("roomid");
const password = params.get("password");

const displayid = document.getElementById("room-id")
if(displayid){
    displayid.innerHTML = "Room ID: " + roomid;
}

const displaypass = document.getElementById("room-password")
if(displaypass){
    displaypass.innerHTML = "Password: " + password;
}

const uploadInput = document.getElementById("upload-btn");
if (uploadInput) {
    uploadInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            headers: {
                roomid: roomid,
                password: password,
            },
            body: formData,
        });

        const data = await response.json();
        console.log(data);
    });
}


const download = document.getElementById("download-btn");
if (download) {
    download.addEventListener("click", async () => {
        const selectfile = document.getElementById("files");

        let dirHandle = null;
        const client = new WebTorrent();
        const magnetLink = selectfile.value;
        
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
                    await writable.write(chunk);
                }

                await writable.close();
                alert("Saved:", file.name);
            } catch (err) {
                console.error("File save failed:", err);
            }
        });
    });
}

fetch("http://localhost:3000/api/files", {
    method: "GET",
    headers: {
        roomid: roomid,
        password: password,
    }
})
    .then(response => response.json())
    .then(data => {
        const selecti = document.getElementById("files");

        // ✅ Clear existing options before adding new ones
        selecti.innerHTML = "";

        data.forEach(file => {
            const option = document.createElement("option");
            option.textContent = file.filename;
            option.value = file.link;

            console.log(file.filename);

            selecti.appendChild(option);
        });
    })
    .catch(error => console.error("Error fetching files:", error));

