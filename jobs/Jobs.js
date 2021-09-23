const { Lightsail } = require('aws-sdk');
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
    if ((min-tm[1]>2) ||(min-tm[1]<0)) {
        return false
    }
    return true;
}
async function boxJob() {
    let boxids = [];
    log.info({module:"Box Job"},"Box Job called")

    const boxes = await BoxModel.find();

    boxes.forEach(box => {
        
        const lastUpdated = box.lastUpdatedAt;
        if(lastUpdated){

            const splitTimeStamp = lastUpdated.split(",");
            const date = splitTimeStamp[0].split("/");
            const time = splitTimeStamp[1].split(':');
    
            const result = compareTimeStamp(date, time);
            if (!result) {
                boxids.push(box.boxid)
            }
        }

    });

    if (boxids.length > 0) {
        let message = `Boxes which have not been updated : ${boxids}`
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
        
        if(lastUpdated){
            
            const splitTimeStamp = lastUpdated.split(",");
            const date = splitTimeStamp[0].split("/");
            const time = splitTimeStamp[1].split(':');
            
            const result = compareTimeStamp(date, time);
           
            if (!result) {
                aggids.push(aggregator.aggregatorID)
            }
        }

    });
            
    if (aggids.length > 0) {
        let message = `Aggregators which have not been updated : ${aggids}`
        log.info({ module: "Aggregator job" }, message)
    } else {
        log.info({ module: "Aggregator job" }, "All Aggregators Updated")
    }
}
async function updateBoxAndAggregator(){
   
    const boxid="e00224000270a4e1";
    const aggregatorID="dca632b8f172";
    const dt= new Date();
    const timestamp=`${dt.getUTCDate()}/${dt.getUTCMonth()+1}/${dt.getUTCFullYear()},${dt.getUTCHours()}:${dt.getUTCMinutes()}`;
    await BoxModel.updateOne({boxid},{lastUpdatedAt:timestamp});
   await AggregatorModel.updateOne({aggregatorID},{lastUpdatedAt:timestamp})
      
}
async function updateAggregator(){
    try {
        const dt= new Date();
        const timestamp=`${dt.getUTCDate()}/${dt.getUTCMonth()+1}/${dt.getUTCFullYear()},${dt.getUTCHours()}:${dt.getUTCMinutes()}`;
       await AggregatorModel.updateOne({aggregatorID:'dca632b8f173'},{lastUpdatedAt:timestamp});
    } catch (error) {
        log.error({module:"Update Aggregator Job"},error,message)
    }
}
async function updateBox(){
    try {
        const dt= new Date();
        const timestamp=`${dt.getUTCDate()}/${dt.getUTCMonth()+1}/${dt.getUTCFullYear()},${dt.getUTCHours()}:${dt.getUTCMinutes()}`;
       await BoxModel.updateOne({boxid:'e00224000270a4e1'},{lastUpdatedAt:timestamp});
    } catch (error) {
        log.error({module:"Update Aggregator Job"},error,message)
    }
}


module.exports = { boxJob, aggregatorJob,updateBoxAndAggregator,updateAggregator,updateBox }

