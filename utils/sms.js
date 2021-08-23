const AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: 'AKIAUCSZD7OQ6OYQSRFA',
    secretAccessKey: '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',
    region: 'us-west-2'
});
function smsaws(phonenumber, smsdata) {
    phonenumber = phonenumber.toString();
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
            console.log("SMS from aws sns");
            console.log(data);
            //res.end(JSON.stringify({ MessageID: data.MessageId }));
        })
        .catch(function (err) {
            // res.end(JSON.stringify({ Error: err }));
            console.log("SMS aws error");
            console.log(err);
        });
}
module.exports = { smsaws };
