const User = require("./models/user")
const validate = require("../utils/validator")
const bcrypt = require("bcrypt")
const Submission = require("./models/submission")
const jwt = require('jsonwebtoken');
const redisClient = require("../config/redis");
const register = async (req,res)=>{   // always register as user 
    try{
        validate(req.body)
        console.log("validation passed")
        const{firstName,emailId,password}= req.body
        req.body.password = await bcrypt.hash(password,10)  // convert password into hash
        req.body.role = 'user'
        const user = await User.create(req.body)
        const token = jwt.sign({_id:user._id , emailId:emailId ,role:'user'}, process.env.JWT_SECRET_KEY ,{expiresIn:60*60})
        const reply = {
            firstName : user.firstName,
            emailId : user.emailId,
            _id: user._id

        }
        res.cookie('token',token,{maxAge:60*60*1000,httpOnly: true,
  secure: true,
  sameSite: "None"})
        res.status(201).json({
            user:reply,
            message: "registered successfully"
        })
    }

    catch(err){
    console.log("Validation error =", err);

    res.status(400).json({
        message: err.message || "Something went wrong"
    });
}
}

const login = async (req,res)=>{
    try{
        const{emailId,password} = req.body;  // frontend bhejaga
        if(!emailId){
            throw new Error("invaild ceredentials")
        }

        if(!password){
            throw new Error("invaild ceredentials")
        }

        const user = await User.findOne({emailId})  // already db ma stored h
        const match  = await bcrypt.compare(password,user.password)
        if(!match)
            throw new Error("invaild ceredentials")
        const reply = {
            firstName : user.firstName,
            emailId : user.emailId,
            _id: user._id

        }
        const token = jwt.sign({_id:user._id , emailId:emailId,role: user.role}, process.env.JWT_SECRET_KEY ,{expiresIn:60*60})
        res.cookie("token", token, {
      httpOnly: true,       // JS cannot access → safe
      secure: false,        // keep false for localhost (no https)
      sameSite: "lax",      // REQUIRED for cross-origin cookies
      path: "/",            // cookie available everywhere
      maxAge: 60 * 60 * 1000
    });
         res.status(201).json({
            user: reply,
            message: "login successfully"
         })
    }
    catch(err){
         console.log("Middleware Error:", err.message);
        res.status(401).send("Error : "+err)
    }
}

const logout = async (req,res)=>{
    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token)

        await redisClient.set(`token:${token}`, 'blocked')  // since token is valid add to redis
        await redisClient.expireAt(`token:${token}`,payload.exp) // expire the token

        res.cookie("token",null,{expires:new Date(Date.now())});
        res.send("logout successfully")

    }
    catch(err){
        res.status(503).send("Error : "+err.message)
    }
}

const adminRegister = async(req,res)=>{
    try{
        validate(req.body)
        const{firstName,emailId,password}= req.body
        // validate the data
        req.body.password = await bcrypt.hash(password,10)  // convert password into hash
        // req.body.role = 'admin'
        const user = await User.create(req.body)
        const token = jwt.sign({_id:user._id , emailId:emailId ,role:user.role}, process.env.JWT_SECRET_KEY ,{expiresIn:60*60})
        res.cookie('token',token,{maxAge:60*60*1000,
                                  httpOnly: true,
                       secure: true,
                    sameSite: "None"})
        res.status(201).send("user registered successfully")
    }

    catch(err){
        res.status(404).send("Error : "+err)

    }

}

const deleteProfile = async(req,res)=>{
    try{
        const userId = req.result._id;

        await User.findByIdAndDelete(userId)

        // delete from submission also
        await Submission.deleteMany(userId)

        res.status(200).send("deleted successfully")

    }
    catch(err){
        res.status(500).send("Internal server error")
    }


}
module.exports = {register,login,logout,adminRegister,deleteProfile}
