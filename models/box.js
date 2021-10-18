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
    constants:[String],
    secondaryOwner: [
        {
            name: String,
            email: String,
            phonenumber: String,
            apptoBoxID: [Number]
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
        enum: ["WAREHOUSE", "DISPATCHED","FACTORY-RESET"]
    },
    lastUpdatedAt: String,
    lid: String,
    motion: String,
    temperature: String,
    battery: String,
    voltage:String,
    aggregatorList: [String]
                




}, { timestamps: true });

module.exports = mongoose.model("Box", boxschema);

