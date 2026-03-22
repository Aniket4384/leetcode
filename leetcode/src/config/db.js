const mongoose = require("mongoose")
require("dotenv").config();

// console.log('DB_CONNECT_STRING from .env:', process.env.DB_CONNECT_STRING);

async function main(){
    await mongoose.connect(process.env.DB_CONNECT_STRING)
}

module.exports = main