document.addEventListener("DOMContentLoaded", () => {
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
          window.location.href = `/createroom?roomid=${encodeURIComponent(roomid)}&password=${encodeURIComponent(pass)}`;
      });
  }


  const uploadInput = document.getElementById("upload");
  if (uploadInput) {
      uploadInput.addEventListener("change", async (event) => {
          const file = event.target.files[0];
          if (!file) return;

          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("http://localhost:3000/upload", {
              method: "POST",
              headers: {
                  roomid: 1111,
                  password: 1212,
              },
              body: formData,
          });

          const data = await response.json();
          console.log(data);
      });
  }
});

const download = document.getElementById("download");
if(download){
  download.addEventListener("click", async () => {
  
    let dirHandle = null;
    dirHandle = await window.showDirectoryPicker();
    const client = new WebTorrent();
    const magnetLink = "magnet:?xt=urn:btih:c87ce4dddeac63d32719127806a1317bb23bddda&dn=SampleVideo_1280x720_1mb.mp4&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.dev";
  
    console.log("WebTorrent client created:", client);
    console.log("Adding torrent:", magnetLink);
        
    
    client.add(magnetLink, async (torrent) => {
        console.log("Downloading:", torrent.name);
  
        const file = torrent.files[0];
        console.log("Filename:", file.name);
  
        try {
            const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
            const writable = await fileHandle.createWritable();
  
            const stream = file.createReadStream();
  
            for await (const chunk of stream) {
                await writable.write(chunk);
            }
  
            await writable.close();
            console.log("Saved:", file.name);
        } catch (err) {
            console.error("File save failed:", err);
        }
    });
  });
}
