const log= require('./serverLogger')
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
        return log.error({module:'SMS2'},err.message)
      }

      resolve(data);
    });
  });
}
module.exports = {smsaws};
