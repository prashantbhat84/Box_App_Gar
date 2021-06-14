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
        enum: ["BOOKINGADMIN", "FACTORYADMIN"],
        default: "BOOKINGADMIN"
    }
});


module.exports = mongoose.model("DashUsers", dashUserSchema);