import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';
import {decryptJSON } from '../encryption'; 



dotenv.config();

mongoose.connect(process.env.MONGO_DB);

const User = mongoose.model('User', { ROOMID: {type : Number, unique : true}, PASSWORD: {type : Number}, MAGNETLINKS: [{ filename: String, link: String }] });
const __dirname = import.meta.dirname;
const app = new express();

app.use(cors(), express.json(), express.text(), express.static('frontend'));

app.get("/", (req, res) => {
    res.sendFile("frontend/create_join_room.html", { root: __dirname });
});

app.get('/host-page',async(req,res)=>{
    res.sendFile("frontend/host_page.html", { root: __dirname });
});

app.post("/checkroom", async (req, res) => {
    const token = req.headers.token;
    const decryptdata = decryptJSON(token);

    const ROOMID = decryptdata.roomid;
    const PASSWORD = decryptdata.password;

    const existingRoom = await User.findOne({ ROOMID: ROOMID, PASSWORD: PASSWORD});

    if (!existingRoom) {
        return res.json({ msg: "NOT FOUND" });
    }
    else {
        return res.json({ msg: "FOUND" });
    }
});

app.get('/createroom/:token', async (req, res) => {
    const token = req.params.token;
    const decryptdata = decryptJSON(token);

    const ROOMID = decryptdata.roomid;
    const PASSWORD = decryptdata.password;

    const existingRoom = await User.findOne({ ROOMID: ROOMID, PASSWORD: PASSWORD});
    
    if (!existingRoom) {
        const newroom = new User({ ROOMID, PASSWORD, MAGNETLINKS: [] });
        await newroom.save();
        console.log("ROOM CREATED");
    }
    
    res.sendFile("frontend/create_page.html", { root: __dirname });
});

app.get('/joinroom', async (req, res) => {
    res.sendFile("frontend/download_page.html", { root: __dirname });
});


app.get('/upload',async(req,res)=>{
    const roomid = req.headers.roomid;
    const password = req.headers.password;
    const filename = req.headers.filename;
    const link = req.headers.link;

    const room = await User.findOne({ROOMID : roomid , PASSWORD : password});

    if(!room){
        return res.status(404).send({msg : "room not found"});
    }
    else{
        const links = room.MAGNETLINKS;
        if(links.length > 0){
            links[0] = {
                filename : filename,
                link : link
            };
            console.log("Links Updated!!!!!!",link);
        }
        else{
            links.push({
                filename : filename,
                link : link
            });
        }
        console.log("LINKS : ",links[0]);
        await User.findOneAndUpdate({ROOMID : roomid , PASSWORD : password},{MAGNETLINKS : links});
        return res.status(200).send({msg : "Link Updated Successfully"});
    }
    
});

app.get('/closeroom',async (req,res)=>{
    const roomid = req.headers.roomid;
    const password = req.headers.password;

    try{
        const room = await User.findOneAndDelete({ROOMID : roomid, PASSWORD : password});
        res.json({msg : "Room Deleted Successfully"});
    }
    catch(err){
        res.json(err);
    }
});

app.get('/getlink',async(req,res)=>{

    const token = req.headers.token;
    const decryptdata = decryptJSON(token);

    const roomid = decryptdata.roomid;
    const password = decryptdata.password;

    const room = await User.findOne({ROOMID : roomid , PASSWORD : password});

    if(room.MAGNETLINKS.length <= 0){
        return res.json({msg : "Link Not Hosted Yet"});
    }
    else{
        return res.json({msg : room.MAGNETLINKS[0]});
    }

});


cron.schedule("*/15 * * * *",async()=>{
    await User.deleteMany({});
    console.log("cleared");
});


app.listen(3000, () => {
    console.log("started 3000");
});