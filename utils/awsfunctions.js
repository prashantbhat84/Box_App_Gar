
const aws = require('aws-sdk');

const nodemailer = require('nodemailer');

const log= require('./serverLogger');



class AWS{
    constructor(){
        aws.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    region: process.env.AWS_REGION
        });
        if(!AWS.instance){
            AWS.instance=this;
        }
    }
    async  sendEmail(email,subject,body) {
    
        const ses = new aws.SES();
        const template= body.template;
       
       const mailOptions = {
       from:'contact@gariyasi.com',
       to:email,
       bcc:'prashanth.b@gariyasi.com',
       subject:subject,
        html:template({code:body.code, courier:body.courier}),
        attachments:[{
            filename:'logo.jpg',
            path:process.cwd()+'/views/logo.jpg',
            cid:'logo'
        }]
       };       
         
      
       // // create Nodemailer SES transporter
       const transporter = nodemailer.createTransport({
           SES: ses
       }); 
          
    
       // send email
       try {
      
           const emailresult=await transporter.sendMail(mailOptions);
           
           return emailresult
       } catch (error) {
           log.error({module:"Email"},error.message)
           throw new Error(error.message)
       }
   }
   smsaws(phonenumber,smsdata){
    phonenumber = "+91" + phonenumber;
    
    const publishTextPromise = new aws.SNS({ apiVersion: "2010-03-31" })
        .publish({
            Message: smsdata,
            PhoneNumber: phonenumber,
            MessageAttributes: {
                "AWS.SNS.SMS.SMSType": {
                    DataType: "String",
                    StringValue: "Transactional",
                },
            },
        })
        .promise();

    publishTextPromise
        .then(function (data) {
            log.info({module:"AWS SMS"},"SMS from aws sns");
           log.info({module:"AWS SMS"},data);
           return;
            //res.end(JSON.stringify({ MessageID: data.MessageId }));
        })
        .catch(function (err) {
            // res.end(JSON.stringify({ Error: err }));
            log.info("SMS aws error");
           
            throw new Error(err.message)

        });
   }

}

const awsInstance= new AWS();
Object.freeze(awsInstance)





module.exports = awsInstance;
