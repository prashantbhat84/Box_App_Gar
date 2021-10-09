const AWS = require("aws-sdk");
const log= require('./serverLogger')

AWS.config.update({
    accessKeyId: 'AKIAUCSZD7OQ6OYQSRFA',
    secretAccessKey: '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',
    region: 'us-west-2'
});
function smsaws(phonenumber, smsdata) {
  
    phonenumber = "+91" + phonenumber;
    console.log(phonenumber);
    const publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
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
               log.info({module:"SMS"},data)
            //res.end(JSON.stringify({ MessageID: data.MessageId }));
        })
        .catch(function (err) {
            // res.end(JSON.stringify({ Error: err }));
           log.error({module:"SMS"},err.message)
        });
}
module.exports = {smsaws};
