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
            name: String,
            email: String,
            phonenumber: String
        }
    ],
    AESKEY: ['String'],
    HMAC: ['String'],

    registrationStatus: {
        type: String,
        default: "UNREGISTERED",
        enum: ["UNREGISTERED", "REGISTERED"]
    },
    boxStatus: {
        type: String,
        default: "WAREHOUSE",
        enum: ["WAREHOUSE", "DISPATCHED"]
    },
    lastUpdatedAt: String,
    aggregatorList: ['String']




}, { timestamps: true });

module.exports = mongoose.model("Box", boxschema);

