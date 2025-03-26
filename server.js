import express from 'express';
import cors from 'cors';
import WebTorrent from 'webtorrent';
import multer from 'multer';
import fs, { link } from 'fs';
import mongoose  from 'mongoose';
import dotenv from 'dotenv';
import path from "path";

dotenv.config();

mongoose.connect(process.env.MONGO_DB);

const User = mongoose.model('User',{ROOMID : Number , PASSWORD : Number , MAGNETLINKS : [{filename : String , link : String}]});
const __dirname = import.meta.dirname;
const app = new express();

app.use(cors(), express.json() , express.text() , express.static('frontend'));

const client = new WebTorrent();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

if(!fs.existsSync("./uploads")){
    fs.mkdirSync("./uploads");
}

async function seedfile(filepath) {
    return new Promise((resolve, reject) => {
        client.seed(filepath, (torrent) => {
            console.log("seeding");
            resolve({filename : torrent.files[0].name ,link : torrent.magnetURI});
        });
    });
}

app.get("/wtf",(req,res)=>{
    res.sendFile("frontend/create_join_room.html", { root: __dirname });
});


app.get('/createroom', async (req, res) => {
    const ROOMID = req.query.roomid;
    const PASSWORD = req.query.password;
    
    console.log("PASSWORD", PASSWORD);
    
    const existingRoom = await User.findOne({ ROOMID: ROOMID });
    
    if (!existingRoom) {
        const newroom = new User({ ROOMID, PASSWORD, MAGNETLINKS: [] });
        await newroom.save();
        console.log("ROOM CREATED");
    } else {
        console.log("ROOM ALREADY EXISTS");
    }
    
    res.sendFile("frontend/room_page.html", { root: __dirname });
    
});



app.get("/first", (req, res) => {
    return res.send("Hello world");
});

app.post("/upload", upload.single("file"), async (req, res) => {
    const ROOMID = req.headers.roomid;
    const PASSWORD = req.headers.password;

    const newroom = await User.findOne({ROOMID : ROOMID , PASSWORD : PASSWORD});

    if(!newroom){
        res.json({msg : "ROOM NOT FOUND"});
    }
    else{
        const new_MAGNETLINKS = newroom.MAGNETLINKS;

        const newlink = await seedfile(req.file.path);

        console.log(newlink);

        new_MAGNETLINKS.push(newlink);

        await User.findOneAndUpdate({ROOMID : ROOMID , PASSWORD : PASSWORD},{MAGNETLINKS : new_MAGNETLINKS});

        res.json({msg : "FILE UPLOADED"});
    }

});

app.get('/showdata',async (req,res)=>{
    const ROOMID = req.headers.roomid;
    const PASSWORD = req.headers.password;

    const room = await User.findOne({ROOMID : ROOMID , PASSWORD : PASSWORD});

    res.send(room.MAGNETLINKS);
});



app.listen(3000, () => {
    console.log("started 3000");
});