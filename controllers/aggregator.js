const response = require('../utils/Response');
const { forgotPassword,boxUpdates,verifyemail }= require('../utils/mailcontent')
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
{phonenumber:'7975265399',email:'raghu@gariyasi.com'},
{phonenumber:"0000000000",email:"prashantbhat84@gmail.com"}]

async function sendSms(phonenumber,phonenumber1,boxid,data){
    log.info({module:"Aggregator"},'sendsms called')
//  const {body,subject}= smsdata;
 const email1= mobileToEmail.find(item=>item['phonenumber']===phonenumber).email;
 
 const email2= mobileToEmail.find(item=>item['phonenumber']===phonenumber1).email ;


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
function getCommandMessage(command,phonenumber,phonenumber1,boxid){
  let message=`Box with id ${boxid}`
  let message2 =` by user with phonenumber ${phonenumber}`
  switch(command){
      case 'O':return  `${message} Opened ${message2} `;
      case 'C':return `${message} Closed ${message2}`;
      case  'T': return `${message} Tamper Reset ${message2}`;
      case 'S': return `New User with phonenumber ${phonenumber1} Added to ${message} ${message2} `
      case 'D': return  ` User with phonenumber ${phonenumber1} Removed from ${message} ${message2} `
      case 'R': return `${message} Reset ${message2}`
      case 'N': return 'No Command'
      default: return `Command not  matched`
  }

}
function getLidMessage(boxlid){
    switch(boxlid){
        case 'O': return "Lid  is Opened";
        case 'C': return 'Lid is Closed';
        case 'T': return 'Lid is Tampered';
        default: return "No Lid Status"
    }

}
function getMotion(motion){
    if(motion==="M"){
        return "Box has  been moved"
    }
    return "Box  has not  been moved"
}


function getdetails(data){
  
    let box=""
    let boxid= data.slice(4,12)
    boxid.forEach(item=>{
        let temp= item.toString(16);
        if(temp.length===1){
        
            box+="0"+temp;
        }else{
           box+=temp;
        }                      
     });
     const primaryuser=data.slice(13,18)
     const secondaryuser= data.slice(18,23)
     const boxlid= String.fromCharCode(data[23]);
     const command= String.fromCharCode(data[12])
     const dt= data.slice(32,39)
    const timestamp= `${dt[0]}/${dt[1]}/${dt[2]},${dt[3]}:${dt[4]}`
     const temperature=data[24];
     const motion= String.fromCharCode(data[25]);
     const boxBatteryStatus=String.fromCharCode(data[26]);
     const boxBatteryVoltage=data[27]/10;
     const aggregatorBatteryStatus= String.fromCharCode(data[28]);
     const aggregatorBatteryVoltage=data[29]/10;
     const phonenumber= convertToStringVal(primaryuser);
     const phonenumber1=convertToStringVal(secondaryuser);
     return {
         box,
        phonenumber,
        phonenumber1,
        boxlid,
        aggid:data[data.length-1],
        command,
        temperature,
        motion,
         BoxBatteryStatus:boxBatteryStatus,
        BoxBatteryVoltage:boxBatteryVoltage,
    AggregatorBatteryStatus:aggregatorBatteryStatus,
AggregatorBatteryVoltage:aggregatorBatteryVoltage,
date:timestamp
};
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
         let result;
         const aggregator= await AggregatorModel.findOne({aggregatorID:req.body.id});
         const date = new Date();
         const time = `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}:${date.getUTCHours()}-${date.getUTCMinutes()}`
        
         if(!aggregator){
             result=await AggregatorModel.create({aggregatorID:req.body.id,lastUpdatedAt:time})
           
         }else{

            result= await AggregatorModel.findOneAndUpdate({ aggregatorID: req.body.id }, { lastUpdatedAt: time }, { new: true, runValidators: true })
         }                
             
          
                
            response.successReponse({ status: 200, result, res })

        } catch (error) {
            log.error({module:"Aggregator"},{url:req.url,function:"updateAggregator",errorMessage:error.message})
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async updateAggregatorAndBox(req, res, next) {
        try {
        //    const data=[14,30,59,20,224, 2, 36, 0, 2, 112, 164, 224,79,88,84,70,11,97,90,8,48,38,8,79,0,83,70,50,21,22,17,15,9,2021,14,11,46,13,'dc632b8f170']
    
                  
           const data=(req.body.body.data);
           
            const details= getdetails(data);
            const commandMessage= getCommandMessage(details.command,details.phonenumber,details.phonenumber1,details.box)
            const lidStatusMessage=getLidMessage(details.boxlid);
              const motionStatus=getMotion(details.motion)
            log.info({module:"AggregatorAnd Box Update"},details)
            const message=commandMessage + ","+lidStatusMessage + " "+"&"+ motionStatus + " "+ `on ${details.date}`;
            log.info({module:"Aggregator And Box Update"},`date:${details.date}`)
            log.info({module:"Aggregator And Box Update"},`BoxID:${details.box}`)
            log.info({module:"Aggregator And Box Update"},`BoxLid:${lidStatusMessage} motion:${motionStatus}`)
            log.info({module:"Aggregator And Box Update"},`temperature:${details.temperature}`);
            log.info({module:"Aggregator And Box Update"},`command:${commandMessage}`);
            
            response.successReponse({ status: 200, result: {message,details}, res })      
           
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
    async updateStaleAggregatorAndBox(req,res,next) {
        // const data=[14,30,59,20,224, 2, 36, 0, 2, 112, 164, 224,79,88,84,70,11,97,90,8,48,38,8,79,0,83,70,50,70,22,17,14,11,46,13,'dc632b8f170'];
        const data= req.body.body.data
          log.info({module:"Aggregator"},data)
    
          let boxid=getdetails(data)
                  
         log.info({module:"Aggregator"},boxid)
          
 
      response.successReponse({ status: 200, result: boxid,res })
    
    }
    
};


const aggregator= new Aggregator();
Object.freeze(aggregator)

module.exports = aggregator