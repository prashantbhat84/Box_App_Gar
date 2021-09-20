const mongoose = require('mongoose');


const aggregatorSchema = mongoose.Schema({
    aggregatorID: String,
    installationStatus: {
        type: Boolean,
        default: false,
        enum: [true, false]
    },
    lastUpdatedAt: String,
    battery:String,
    voltage:String




}, { timestamps: true });

module.exports = mongoose.model("Aggregator", aggregatorSchema);

