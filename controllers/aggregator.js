const response = require('../utils/Response');
const { forgotPassword,boxUpdates }= require('../utils/mailcontent')
const logger = require('../utils/logger');
const log= require("../utils/serverLogger")
const AggregatorModel = require("../models/aggregator")
const sms2 = require("../utils/sms2");
const sms = require("../utils/sms");
const awsInstance = require("../utils/awsfunctions")
let lastCommand,lastBoxLidStatus;
const mobileToEmail=[{
    phonenumber:'8884701197',email:'prashantbhat91@gmail.com'},
{phonenumber:'9632349451',email:'sudarshana.rd@gariyasi.com'},
{phonenumber:'9652437698',email:'mrkodi@gmail.com'},
{phonenumber:'9008483808',email:'ksmadhu01@gmail.com'},
{phonenumber:'9845544304',email:'raghu@gariyasi.com'},
{phonenumber:'7975265399',email:'raghu@gariyasi.com'}]

async function sendSms(phonenumber,phonenumber1,boxid,data){
    log.info({module:"Aggregator"},'sendsms called')
//  const {body,subject}= smsdata;
 const email1= mobileToEmail.find(item=>item['phonenumber']===phonenumber).email;
 
//  const email2= mobileToEmail.find(item=>item['phonenumber']===phonenumber1).email ;
const email2="prashantbhat84@gmail.com";

await boxUpdates(email1,email2,boxid,data);


   
}
function convertToStringVal(phone){
    let temp="";
   phone.forEach(item=>{
        
          if(item.toString().length===1){
               temp+="0"+item;
          }else{
              temp+=item
          }
      });
      return temp;
}
class Aggregator {
    constructor ()  {
        if(!Aggregator.instance){
            Aggregator.instance=this;
        }
        return Aggregator.instance;
    }

    async updateAggregator(req, res, next) {
        try {
          
         log.info({module:"Aggregator"},{url:req.url,function:"updateAggregator"})
                 
        //   await awsInstance.sendEmail('prashantbhat84@gmail.com',"ForgotPassword",'forgotPassword')
                
            const date = new Date();
            const time = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}:${date.getHours() + 5}-${date.getMinutes() + 30}`

            // const aggregator = await AggregatorModel.findOneAndUpdate({ aggregatorID: req.body.id }, { lastUpdatedAt: time }, { new: true, runValidators: true })
                // await sendSms('8884701197','9008483808','12345','box opened')
            response.successReponse({ status: 200, result: time, res })

        } catch (error) {
            log.error({module:"Aggregator"},{url:req.url,function:"updateAggregator",errorMessage:error.message})
            response.errorResponse({ status: 400, result: error.message, res })
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
                            
           })  ;
           const aggid= data[data.length-1];
           const primaryuser=data.slice(13,18)
           const secondaryuser= data.slice(18,23)
           const boxlid= data[24];
           const phonenumber= convertToStringVal(primaryuser);
           const phonenumber1=convertToStringVal(secondaryuser);
           log.info({module:"Aggregator"},{phonenumber,phonenumber1})
           if((lastBoxLidStatus!==boxlid) &&(boxlid===84)){
            log.info({module:"Aggregator"},'inside lid tamper')
               lastBoxLidStatus=boxlid;
               const email=  mobileToEmail.find(item=>item['phonenumber']===phonenumber).email;
               await boxUpdates(email,'prashantbhat91@gmail.com',box,`Box with ${box} tampered`)
           }
           let smsdata;       
           let command = (data[12]);
           log.info({module:"Aggregator"},{BOXID:box,AGGREGATORID:aggid,SENDERID:phonenumber,BOXLID:String.fromCharCode(boxlid.toString(16)),command,lastCommand})       
                   
              
                if(lastCommand!==command){
                    switch(command){
                        case 79:   
                                   
                                   lastCommand=command;
                                     smsdata=`Box with id ${box} Opened` 
                                     log.info({module:"Aggregator"},smsdata)                                
                                   await sendSms(phonenumber,phonenumber1,box,smsdata)
                             
                               break;
                        case 67:                    
                            
                            lastCommand=command;
                            smsdata=`Box with id ${box} Closed`
                            log.info({module:"Aggregator"},smsdata) 
                            await sendSms(phonenumber,phonenumber1,box,smsdata)
                                        
                        break;
                        case 83:                   
                                
                                log.info({ADDED_USER:phonenumber1})
                                lastCommand=command;
                                smsdata=`User  with mobile # ${phonenumber1}Added to box with id ${box}`
                                log.info({module:"Aggregator"},smsdata) 
                                await sendSms(phonenumber,phonenumber1,box,smsdata)
                          
                            break;
                        case 68:                       
                                
                                log.info({REMOVED_USER:phonenumber1})
                                lastCommand=command;
                                smsdata=`User with mobile # ${phonenumber1}  Removed from box with id ${box}`
                                log.info({module:"Aggregator"},smsdata) 
                                await sendSms(phonenumber,phonenumber1,box,smsdata)
                            
                            break;
                        case 82:                   
                            
                            lastCommand=command;
                            smsdata=`Box with id ${box} Reset`
                            log.info({module:"Aggregator"},smsdata) 
                            await sendSms(phonenumber1,phonenumber1,box,smsdata)
                            break;
                        case 84:
                            
                            lastCommand=command;
                            smsdata=`Box with id ${box} Tampered`
                            log.info({module:"Aggregator"},smsdata) 
                            await sendSms(phonenumber,phonenumber1,box,smsdata)
                            break;                 
                    }

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


const aggregator= new Aggregator();
Object.freeze(aggregator)

module.exports = aggregator