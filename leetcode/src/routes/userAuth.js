const express = require("express")
const userMiddleware = require("../middleware/userMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")
const authRouter = express.Router()
const{register,login,logout,adminRegister,deleteProfile} = require("../controllers/userAuthenticate")
//Register

authRouter.post("/register",register)
authRouter.post("/login", login)
authRouter.post('/logout',  userMiddleware ,logout)
authRouter.post("/admin/register",adminMiddleware , adminRegister)   // admin will make by admin itself
authRouter.delete("/deleteProfile" ,userMiddleware , deleteProfile )
authRouter.get("/check",userMiddleware,(req,res)=>{
    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id,
        role: req.result.role
    }
    res.status(200).json({
        user: reply,
        message : "valid user"
    })
})
// adminMiddleware --> verify if admin or not 
// authRouter.get('/getProfile',getProfile)

module.exports = authRouter
//logout
//login
//get profile