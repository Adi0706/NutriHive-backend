const mongoose = require("mongoose")

const UserSignupSchema = mongoose.Schema({
    firstName : String , 
    lastName : String ,
    email :String , 
    password : String
})

const UserSignUpModel = mongoose.model('UsersResgistration',UserSignupSchema)

module.exports = UserSignUpModel