const mongoose = require('mongoose')
const Box = require("./box")

const userschema = mongoose.Schema({

    email: {
        type: String,
        unique: true

    },
    phonenumber: {
        type: String,
        unique: true

    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,

    },
    box: ["String"],

    userlist: [{
        name: String,
        email: String,
        phonenumber: String,
        address: String,
        apptoBoxID: [Number]
    }],

    token: String,
    forgotPasswordCode: String,

    userverified: {
        type: Boolean,
        enum: [true, false],
        default: false
    },
    address: String,
    phoneVerify: String,
    emailVerify: String,
    apptoBoxID: [Number]

});

userschema.indexes({ phonenumber: 1 }, { unique: true, sparse: true })
userschema.pre('save', function () {

})


module.exports = mongoose.model("User", userschema);