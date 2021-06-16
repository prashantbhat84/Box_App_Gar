const mongoose = require('mongoose');


const boxschema = mongoose.Schema({
    boxid: {
        type: String,
        required: true,
        unique: true
    },

    orderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    primaryOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    secondaryOwner: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    registrationStatus: {
        type: String,
        default: "UNREGISTERED",
        enum: ["UNREGISTERED", "REGISTERED"]
    },
    boxStatus: {
        type: String,
        default: "UNTAMPERED",
        enum: ["UNTAMPERED", "TAMPERED", "CLOSED", "OPENED"]
    },
    lastUpdatedAt: String,



}, { timestamps: true });

module.exports = mongoose.model("Box", boxschema);

