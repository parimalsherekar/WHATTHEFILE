const params = new URLSearchParams(window.location.search);
const roomid = params.get('roomid');
const password = params.get('password');



const inputFile = document.getElementById("input-file");

async function seedfile(file) {
    const client = new WebTorrent();
    console.log(client);
    return new Promise((resolve, reject) => {
        client.seed(file, (torrent) => {
            resolve({filename : torrent.name,link : torrent.magnetURI});
        });
    });
}


inputFile.addEventListener("change",async (event) => {
    const file = event.target.files[0];
    const fileNameElement = document.getElementById("file-name");

    if (file) {
        const link = await seedfile(file);

        const Response =await fetch("http://localhost:3000/upload",{
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
});


