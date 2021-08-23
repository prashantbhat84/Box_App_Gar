const Nexmo = require("nexmo");
const nexmo = new Nexmo({
  apiKey: "8dff901e",
  apiSecret: "oVj6So3EFbpTYbrZ",
});

var result = "";
function smsaws(phonenumber,  smsdata) {
  

  

  return new Promise(function (resolve, reject) {
    nexmo.message.sendSms("918884701197", phonenumber, smsdata, (err, data) => {
      if (err) {
        return console.log(err);
      }

      resolve(data);
    });
  });
}
module.exports.sms = smsaws;
