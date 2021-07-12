const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    OrderID: String,
    Box: {
        type: String
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderStatus: {
        type: String,
        default: "WAREHOUSE",
        enum: ["WAREHOUSE", "DISPATCHED", "CANCELLED"]
    },
    courierName: String,
    docketNo: String

});


module.exports = mongoose.model("Order", OrderSchema);