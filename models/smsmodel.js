const mongoose = require('mongoose')
const Box = require("./box")

const userschema = mongoose.Schema({

   boxid:String,
   aggid:String,
   command:String

});

userschema.indexes({ phonenumber: 1 }, { unique: true, sparse: true })
userschema.pre('save', function () {

})


module.exports = mongoose.model("User", userschema);