const response = require('../utils/Response');
const { forgotPassword, boxUpdates, verifyemail } = require('../utils/mailcontent')
const logger = require('../utils/logger');
const BoxModel = require('../models/box')
const log = require("../utils/serverLogger")
const AggregatorModel = require("../models/aggregator")
const Notification= require("../models/Notification")
const User= require('../models/user')
const sms2 = require("../utils/sms2");
const sms = require("../utils/sms");
const awsInstance = require("../utils/awsfunctions")
const {boxJob}= require('../jobs/Jobs')
let lastCommand, lastBoxLidStatus;


async function sendSms(phonenumber, phonenumber1, boxid, data) {
    log.info({ module: "Aggregator" }, 'sendsms called')
    //  const {body,subject}= smsdata;
    const email1 = mobileToEmail.find(item => item['phonenumber'] === phonenumber).email;

    const email2 = mobileToEmail.find(item => item['phonenumber'] === phonenumber1).email;


    await boxUpdates(email1,  boxid, data);



}
function convertToStringVal(phone) {
    let temp = "";
    phone.forEach(item => {

        if (item.toString().length === 1) {
            temp += "0" + item;
        } else {
            temp += item
        }
    });
    return temp;
}
function getCommandMessage(command, phonenumber, phonenumber1, boxid) {
           log.info({module:"Command Message Module"},command)
    let message2 = ` CommandSentBy: ${phonenumber}`
    switch (command) {
        case 'O': return ` Open ${message2} `;
        case 'C': return ` Closed ${message2}`;
        case 'T': return ` Tamper Reset ${message2}`;
        case 'S': return `New User id ${phonenumber1} Added    ${message2} `
        case 'D': return ` User  id  ${phonenumber1} Removed  ${message2} `
        case 'R': return ` Reset(FACTORY RESET) ${message2}`
        case 'N': return 'No Command'
        default: return `Command not  matched`
    }

}
function getLidMessage(boxlid) {
    switch (boxlid) {
        case 'O': return " OPEN";
        case 'C': return ' CLOSED';
        case 'T': return ' TAMPERED';
        case 'L': return ' LOCKED';
        default: return "No Lid Status"
    }

}
function getMotion(motion) {
    if (motion === "M") {
        return "MOVED"
    }
    return "STATIONERY"
}


function getdetails(data) {

    let box = ""
    let boxid = data.slice(4, 12)
    boxid.forEach(item => {
        let temp = item.toString(16);
        if (temp.length === 1) {

            box += "0" + temp;
        } else {
            box += temp;
        }
    });
    const primaryuser = data.slice(13, 18)
    const secondaryuser = data.slice(18, 23)
    const boxlid = String.fromCharCode(data[23]);
    const command = String.fromCharCode(data[12])
    const dt = data.slice(32, 39)
    const timestamp = `${dt[0]}/${dt[1]}/${dt[2]},${dt[3]}:${dt[4]}`
    const temperature = data[24];
    const motion = String.fromCharCode(data[25]);
    const boxBatteryStatus = String.fromCharCode(data[26]);
    const boxBatteryVoltage = data[27] / 10;
    const aggregatorBatteryStatus = String.fromCharCode(data[28]);
    const aggregatorBatteryVoltage = data[29] / 10;
    const phonenumber = convertToStringVal(primaryuser);
    const phonenumber1 = convertToStringVal(secondaryuser);
    return {
        box,
        phonenumber,
        phonenumber1,
        boxlid,
        aggid: data[data.length - 1],
        command,
        temperature,
        motion,
        BoxBatteryStatus: boxBatteryStatus,
        BoxBatteryVoltage: boxBatteryVoltage,
        AggregatorBatteryStatus: aggregatorBatteryStatus,
        AggregatorBatteryVoltage: aggregatorBatteryVoltage,
        date: timestamp
    };
}
class Aggregator {
    constructor() {
        if (!Aggregator.instance) {
            Aggregator.instance = this;
        }
        return Aggregator.instance;
    }

    async updateAggregator(req, res, next) {
        try {

            log.info({ module: "Aggregator" }, { url: req.url, function: "updateAggregator" })
            let result;
            const aggregator = await AggregatorModel.findOne({ aggregatorID: req.body.id });
            const date = new Date();
            const time = `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}:${date.getUTCHours()}-${date.getUTCMinutes()}`

            if (!aggregator) {
                result = await AggregatorModel.create({ aggregatorID: req.body.id, lastUpdatedAt: time })

            } else {

                result = await AggregatorModel.findOneAndUpdate({ aggregatorID: req.body.id }, { lastUpdatedAt: time }, { new: true, runValidators: true })
            }



            response.successReponse({ status: 200, result, res })

        } catch (error) {
            log.error({ module: "Aggregator" }, { url: req.url, function: "updateAggregator", errorMessage: error.message })
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async updateAggregatorAndBox(req, res, next) {
        try {
            //    const data=[14,30,59,20,224, 2, 36, 0, 2, 112, 164, 224,79,88,84,70,11,97,90,8,48,38,8,79,0,83,70,50,21,22,17,15,9,2021,14,11,46,13,'dc632b8f170']

     
            const data = (req.body.body.data);

            const details = getdetails(data);
        //   const details={
        //     "box": "e00224000270a4e4",
        //     "phonenumber": "8197852082",
        //     "phonenumber1": "000000000",
        //     "boxlid": "T",
        //     "aggid": "dc632b8f170",
        //     "command": "C",
        //     "temperature": 0,
        //     "motion": "S",
        //     "BoxBatteryStatus": "L",
        //     "BoxBatteryVoltage": 5,
        //     "AggregatorBatteryStatus": "F",
        //     "AggregatorBatteryVoltage": 2.2,
        //     "date":"10/20/2021,13:25"
        //   }
 
          const box= await BoxModel.findOne({boxid:details.box}).populate("primaryOwner");
            const commandMessage = getCommandMessage(details.command, details.phonenumber, details.phonenumber1, details.box)
            const lidStatusMessage = getLidMessage(details.boxlid);
           
            if(lidStatusMessage===" TAMPERED"&&box.lid!=="TAMPERED"){
                       

                             await boxUpdates(box.primaryOwner.email,"Unauthorised Box Access",`There has been an unauthorised access for your box with id ${details.box}`)
                             await awsInstance.smsaws(box.primaryOwner.phonenumber,`Unauthorised access for box with id ${details.box}`)
                         
            }
            if((details.command==="S")&&(details.phonenumber!==details.phonenumber1)){
                const user= await User.findOne({phonenumber:details.phonenumber});
              
            await Notification.deleteOne({userid:user._id});
           
            }
            if((details.command==="O")){
                
                  
                const user = await User.findOne({phonenumber:details.phonenumber})
                if(box.primaryOwner.phonenumber!==details.phonenumber){
                    //  await awsInstance.smsaws(box.primaryOwner.phonenumber,`Box with id:${details.box} opened by ${user.name}`)
                    await boxUpdates(box.primaryOwner.email,"Box Open Update",`Box with id ${details.box} has been opened by ${user.name}`)
                   
                }
               
            }
            const motionStatus = getMotion(details.motion)
            if((motionStatus==="MOVED")&&(box.motion==="STATIONERY")){
               
                          
                    await boxUpdates(box.primaryOwner.email,"Box Moved Update",`This is to inform that  box with id ${details.box} has been moved from its current position`)
                    // await awsInstance.smsaws(box.primaryOwner.phonenumber,`box with id ${details.box} has moved from its current position`)
                
            }
            if(details.BoxBatteryStatus==="L"&&box.battery!=="L"){
               

                    await boxUpdates(box.primaryOwner.email,"Box Battery Update",`This is to inform that  box with id ${details.box} has Low Battery`)
                    // await awsInstance.smsaws(box.primaryOwner.phonenumber,`box with id ${details.box} has low Battery`)
                
            }
             
            // log.info({ module: "AggregatorAnd Box Update" }, details)
            const message = commandMessage + "," + lidStatusMessage + " " + "&" + motionStatus + " " + `on ${details.date}`;
            // log.info({ module: "Aggregator And Box Update" }, `Date: ${details.date}`)
            // log.info("");
            // log.info({ module: "Aggregator And Box Update" }, `BoxID: ${details.box}`)
            // log.info("");
            // log.info({ module: "Aggregator And Box Update" }, `AggID: ${details.aggid}`);
            // log.info("");
            // log.info({ module: "Aggregator And Box Update" }, `BoxLid: ${lidStatusMessage}`)
            // log.info("");
            // log.info({ module: "Aggregator And Box Update" }, `Motion: ${motionStatus}`)
            // log.info("");
            // log.info({ module: "Aggregator And Box Update" }, `Temperature: ${details.temperature}`);
            // log.info("");
            // log.info({ module: "Aggregator And Box Update" }, `Command: ${commandMessage}`);
            // log.info("");
            const boxDetails = await BoxModel.findOne({ boxid: details.box });
           
            await BoxModel.findOneAndUpdate({ boxid: details.box }, {
                lastUpdatedAt: details.date,
                lid: lidStatusMessage,
                motion: motionStatus,
                temperature: details.temperature,
                battery: details.BoxBatteryStatus,
                voltage:details.BoxBatteryVoltage,
                $addToSet: {
                    aggregatorList: [details.aggid]
                }

            })
            await AggregatorModel.findOneAndUpdate({ aggregatorID: details.aggid },
                {
                    lastUpdatedAt: details.date,
                    battery: details.AggregatorBatteryStatus,
                    voltage:details.AggregatorBatteryVoltage
                                })
           
           
             
                    

            response.successReponse({ status: 200, result: { message, details }, res })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async createAggregator(req, res, next) {
        try {
           
            req.body.aggregatorID = req.body.id
           
            const aggregator = await AggregatorModel.create(req.body)
            response.successReponse({ status: 200, result: aggregator, res })
        } catch (error) {
            response.errorResponse({ status: 400, result: "Failure", res })
        }
    }
    async updateStaleAggregatorAndBox(req, res, next) {
        // const data=[14,30,59,20,224, 2, 36, 0, 2, 112, 164, 224,79,88,84,70,11,97,90,8,48,38,8,79,0,83,70,50,70,22,17,14,11,46,13,'dc632b8f170'];
        const data = req.body.body.data
        log.info({ module: "Aggregator" }, data)

        let boxid = getdetails(data)

        log.info({ module: "Aggregator" }, boxid)


        response.successReponse({ status: 200, result: boxid, res })

    }

};


const aggregator = new Aggregator();
Object.freeze(aggregator)

module.exports = aggregator