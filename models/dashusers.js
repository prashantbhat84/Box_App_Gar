const mongoose = require('mongoose');

const dashUserSchema = mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email",
        ],
    },
    password: String,
    token: { type: String },

    role: {
        type: String,
        enum: ["BOOKING-ADMIN", "FACTORY-ADMIN"],
        default: "BOOKING-ADMIN"
    },
    forgotPasswordCode: String
});


module.exports = mongoose.model("DashUsers", dashUserSchema);