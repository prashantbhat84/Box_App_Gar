const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    OrderID: String,
    Box: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box'
    }],
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },

});


module.exports = mongoose.model("Order", OrderSchema);