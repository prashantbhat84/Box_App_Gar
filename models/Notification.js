const mongoose = require('mongoose');


const notificationschema = mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    senderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    boxid: String,
    description: String,
    response: String,
    expired: {
        type: Boolean,
        enum: [true, false],
        default: false
    }



}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationschema);

