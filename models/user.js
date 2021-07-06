const mongoose = require('mongoose')
const Box = require("./box")

const userschema = mongoose.Schema({

    email: {
        type: String,

    },
    phonenumber: {
        type: String,

    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,

    },
    primarybox: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box'
    }],
    secondarybox: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box'
    }],

    userverified: {
        type: Boolean,
        enum: [true, false],
        default: false
    },
    address: String

});

userschema.indexes({ phonenumber: 1 }, { unique: true, sparse: true })
userschema.pre('save', function () {

})


module.exports = mongoose.model("User", userschema);