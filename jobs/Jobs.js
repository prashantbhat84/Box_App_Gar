const AggregatorModel = require('../models/aggregator');
const BoxModel = require('../models/box');

const log = require("../utils/serverLogger")
function compareTimeStamp(dt, tm) {
    const timeStamp = new Date();
    const hours = timeStamp.getUTCHours();
    const min = timeStamp.getUTCMinutes();
    const date = timeStamp.getUTCDate();
    const month = timeStamp.getUTCMonth() + 1;
    if (dt[0] < date) {
        return false;
    }
    if (dt[1] < month) {
        return false;
    }
    if (tm[0] < hours) {
        return false;
    }
    if (min-tm[1]>2 ||(min-tm[1]<0)) {
        return false
    }
    return true;
}
async function boxJob() {
    let boxids = [];


    const boxes = await BoxModel.find();

    boxes.forEach(box => {
        
        const lastUpdated = box.lastUpdatedAt;
        const splitTimeStamp = lastUpdated.split(",");
        const date = splitTimeStamp[0].split("/");
        const time = splitTimeStamp[1].split(':');

        const result = compareTimeStamp(date, time);
        if (!result) {
            boxids.push(box.boxid)
        }

    });

    if (boxids.length > 0) {
        let message = `Boxes which have not been updated are ${boxids}`
        log.info({ module: "Box job" }, message)
    } else {
        log.info({ module: "Box job" }, "All Boxes Updated")
    }


}

async function aggregatorJob() {
    let aggids = [];


    const aggregators = await AggregatorModel.find();

    aggregators.forEach(aggregator => {
      
        const lastUpdated = aggregator.lastUpdatedAt;
        const splitTimeStamp = lastUpdated.split(",");
        const date = splitTimeStamp[0].split("/");
        const time = splitTimeStamp[1].split(':');

        const result = compareTimeStamp(date, time);
        if (!result) {
            aggids.push(aggregator.aggregatorID)
        }

    });

    if (aggids.length > 0) {
        let message = `Aggregators which have not been updated are ${aggids}`
        log.info({ module: "Aggregator job" }, message)
    } else {
        log.info({ module: "Aggregator job" }, "All Aggregators Updated")
    }
}


module.exports = { boxJob, aggregatorJob }

