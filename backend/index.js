const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./user');

const app = express();
app.use(express.json());
require('dotenv').config();
const SECRETE_KEY = process.env.SECRETE_KEY||'supersecretkey';
const PORT = process.env.PORT||8080;


app.get("/",(req,res)=>{
    res.status(200).json({message:'Welcome to my backedn server'})
})


function authenticateToken(req,res,next){
    const token = req.cookies.token;
    if(!token){
        return res.status(404).json({message:'Unauthorized : token not found'});
    }
    try {
        const decoded = jwt.verify(token,SECRETE_KEY);
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(400).json({message:'Forbidded: token invalid'});
    }
}

app.post("/register",async(req,res)=>{
    const{username,password,role} = req.body;
    if(!username||!password||!role){
        return res.status(400).json({message:'please fill all the required fields'});
    }

    const exisitUser = await User.findOne({username});
    if(exisitUser){
        return res.status(400).json({message:'User already exist'});
    }
    const newUser = new User({username,password,role})
    newUser.save();
    res.cookie('username',username,{httpOnly:true});
    res.json({message:'User registered successsfully'});
})

app.post("/login",async(req,res)=>{
    const{username,password} = req.body;
    const user = await User.findOne({username});
    if(!user){
        return res.status(404).json({message:'User does not exist'});
    }
    const token = jwt.sign({username:user.username},SECRETE_KEY,{expiresIn:'1h'});
    res.cookie('token',token,{httpOnly:true});
    res.json({message:'user logedin successfully'});
})

app.get("/admin",authenticateToken,(req,res)=>{
    const user = User.findOne({username:req.user.username});
    if(!user){
        return res.status(404).json({message:'404 NOT FOUND'});
    }
    res.status(200).json({message:`Welcome back Admin ${req.user.username}`});
});

app.get("/user",authenticateToken,(req,res)=>{
    const user = User.findOne({username:req.user.username});
    if(!user){
        return res.status(404).json({message:'404 NOT FOUND'});
    }
    res.status(200).json({message:`Welcome back User ${req.user.username}`});
})


mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`The server is running on ${PORT}`);
    })
}).catch((err)=>{
    console.log("Something went wrong",err);
})
