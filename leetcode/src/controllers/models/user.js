const mongoose = require("mongoose")
const {schema} = mongoose

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        minLength : 3,
        required : true,
        maxLenght : 28
    },

    lastName:{
        type: String,
         minLength : 3,
        maxLenght : 28,
    },
    emailId:{
        type: String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        uppercase : true,
        immutable: true
    },

    age:{
        type: Number,
       
        min : 10,
        max : 80,
    },

    role:{
        type: String,
        enum: ['user' , 'admin'],
        default : 'user',
       
    },

    problemSolved:{
        type : [{
            type: mongoose.Schema.ObjectId,
            ref : 'problem',
            unique: true 
        }], // unique problems solved
        // store problem id rather than submission id because submision id is differenr for every submission
    },

    password:{
        type: String,
        required: true
    }
}, {timestamps:true})

const user =  mongoose.model("user",userSchema);
module.exports = user