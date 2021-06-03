const mongoose = require('mongoose');
const User = require('./user')

const boxschema = mongoose.Schema({
    boxid: {
        type: String,
        required: true,
        unique: true
    },
    qrcode: {
        type: String,
        required: true,
        unqiue: true
    },

    registrationStatus: {
        type: String,
        default: "UNREGISTERED",
        enum: ["UNREGISTERED", "REGISTERED"]
    },
    lastUpdated: {
        type: String
    }


}, { timestamps: true });

module.exports = mongoose.model("Box", boxschema);

