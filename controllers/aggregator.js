const Response = require('../utils/Response');
const response = new Response();
const logger = require('../utils/logger');
const AggregatorModel = require("../models/aggregator")
// const sms2 = require("../utils/sms2");
const sms = require("../utils/sms");
const email = require("../utils/sendMail")
let lastCommand;


async function sendSms(phonenumber, phonenumber1,smsdata){
      console.log(phonenumber,phonenumber1)
    // await sms.smsaws(phonenumber, smsdata)
    //         await sms.smsaws(phonenumber1, smsdata)
}
function convertToStringVal(phone){
    let temp="";
   phone.forEach(item=>{
        console.log(item);
          if(item.toString().length===1){
               temp+="0"+item;
          }else{
              temp+=item
          }
      });
      return temp;
}
class Aggregator {

    async updateAggregator(req, res, next) {
        try {
            console.log("Aggregator updated")
            console.log(req.body);
            const date = new Date();
            const time = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}:${date.getHours() + 5}-${date.getMinutes() + 30}`

            const aggregator = await AggregatorModel.findOneAndUpdate({ aggregatorID: req.body.id }, { lastUpdatedAt: time }, { new: true, runValidators: true })

            response.successReponse({ status: 200, result: aggregator, res })

        } catch (error) {
            response.errorResponse({ status: 400, result: "Failure", res })
        }
    }
    async updateAggregatorAndBox(req, res, next) {
        try {
        //    const data=[14,30,59,20,224, 2, 36, 0, 2, 112, 164, 224,79,88,84,70,11,97,90,8,48,38,8,79,0,83,70,50,21,22,17,14,11,46,13,'dc632b8f170']
          console.log(req.body)
           const data=(req.body.body.data);
            let boxid= data.slice(4,12)
            let box=""
           boxid.forEach(item=>{
              let temp= item.toString(16);
              if(temp.length===1){
                  box+="0"+temp;
              }else{
                  box+=temp
              }
                            
           })          
           const primaryuser=data.slice(13,18)
           const secondaryuser= data.slice(18,23)
           const phonenumber= convertToStringVal(primaryuser);
           const phonenumber1=convertToStringVal(secondaryuser);
           const aggid= data[data.length-1];
           
        let smsdata;       
            let command = (data[12]);
            console.log({command})
            if(lastCommand!==command){
                switch(command){
                    case 79:   
                               console.log(`Box open`);
                               lastCommand=command;
                                 smsdata=`Box with id ${box} Opened`                                 
                               await sendSms(phonenumber,phonenumber1,smsdata)
                         
                           break;
                    case 67:                    
                        console.log(`Box close`);
                        lastCommand=command;
                        smsdata=`Box with id ${box} Closed`
                        await sendSms(phonenumber,phonenumber1,smsdata)
                                    
                    break;
                    case 83:                   
                            console.log(`Store User`);
                            lastCommand=command;
                            smsdata=`User Added to box with id ${box}`
                            await sendSms(phonenumber,phonenumber1,smsdata)
                      
                        break;
                    case 68:                       
                            console.log(`Remove  User`);
                            lastCommand=command;
                            smsdata=`User Removed from box with id ${box}`
                            await sendSms(phonenumber,phonenumber1,smsdata)
                        
                        break;
                    case 82:                   
                        console.log(`Box Reset`);
                        lastCommand=command;
                        smsdata=`Box with id ${box} Reset`
                        await sendSms(phonenumber1,phonenumber1,smsdata)
                        break;
                    case 84:
                        console.log(`Box Tamper`);
                        lastCommand=command;
                        smsdata=`Box with id ${box} Tampered`
                        await sendSms(phonenumber,phonenumber1,smsdata)
                        break;                 
                }
                   
            }else{
               smsdata=('last command and present command are same');
            } 
                        response.successReponse({ status: 200, result: req.body, res })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async createAggregator(req, res, next) {
        try {
            const date = new Date();
            req.body.aggregatorID = req.body.id
            req.body.lastUpdatedAt = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}:${date.getHours()}-${date.getMinutes()}`
            const aggregator = await AggregatorModel.create(req.body)
            response.successReponse({ status: 200, result: aggregator, res })
        } catch (error) {
            response.errorResponse({ status: 400, result: "Failure", res })
        }
    }
};




module.exports = Aggregator