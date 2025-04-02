
document.addEventListener('DOMContentLoaded', () => {
    async function seedfile(file) {
        const client = new WebTorrent();
        console.log(client);
        return new Promise((resolve, reject) => {
            client.seed(file, (torrent) => {
                resolve({filename : torrent.name,link : torrent.magnetURI});
            });
        });
    }
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const spotlight = document.getElementById('spotlight');

    const params = new URLSearchParams(window.location.search);
    const roomid = params.get("roomid");
    const password = params.get("password");

    // New elements
    const fileUploaded = document.getElementById('fileUploaded');
    const uploadedFileName = document.getElementById('uploadedFileName');
    const initialContent = document.getElementById('initialContent');
    const afterUploadContent = document.getElementById('afterUploadContent');

    // Spotlight effect
    document.addEventListener('mousemove', (e) => {
        spotlight.style.opacity = '1';
        spotlight.style.transform = `translate(${e.clientX - 25}px, ${e.clientY - 25}px)`;
    });

    document.getElementById("rn").innerHTML = roomid;
    document.getElementById("rp").innerHTML = password;

        document.addEventListener('mouseleave', () => {
            spotlight.style.opacity = '0';
        });

    // Click on drop zone to trigger file input
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    // Handle file input change
    fileInput.addEventListener('change', handleFileSelect, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropZone.classList.add('dragover');
    }

    function unhighlight() {
        dropZone.classList.remove('dragover');
    }

    async function handleDrop(e) {
        const dt = e.dataTransfer;
        if (dt.files && dt.files.length > 0) {
            const file = dt.files[0]; // Only take the first file
            handleFile(file);

            const client = new WebTorrent();
            console.log(client);

            if (file) {
                const link = await seedfile(file);
        
                const Response =await fetch("http://192.168.178.135:3000/upload",{
                    method : "GET",
                    headers : {
                        roomid : roomid,
                        password : password,
                        filename : link.filename,
                        link : link.link
                    }
                });
        
                const data = await Response.json();
        
                console.log(data);
            } else {
                alert("FILE NOT UPLOADED");
            }

        }
    }

    async function handleFileSelect(e) {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]; // Only take the first file
            handleFile(file);

            const client = new WebTorrent();
            console.log(client);

            if (file) {
                const link = await seedfile(file);
        
                const Response =await fetch("http://192.168.178.135:3000/upload",{
                    method : "GET",
                    headers : {
                        roomid : roomid,
                        password : password,
                        filename : link.filename,
                        link : link.link
                    }
                });
        
                const data = await Response.json();
        
                console.log(data);
            } else {
                alert("FILE NOT UPLOADED");
            }
        }
    }

    function handleFile(file) {
        // Update the uploaded file name
        uploadedFileName.textContent = file.name;

        // Hide the drop zone and show the uploaded view
        dropZone.style.display = 'none';
        fileUploaded.style.display = 'block';

        // Change the right side content
        initialContent.style.display = 'none';
        afterUploadContent.style.display = 'block';

        // Here you would add code to actually share the file
        console.log(`File "${file.name}" is now being shared`);
    }

    window.onbeforeunload = function () {
        return "Data will be lost if you leave the page, are you sure?";
    };

    const closeButton = document.querySelector("#x");
    if (closeButton) {
        closeButton.addEventListener("click", function () {
            location.reload();
        });
    }

    
});

