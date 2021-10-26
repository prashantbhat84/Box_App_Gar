function convertToObjectID(id) {
    return new mongoose.Types.ObjectId(id);
}
function convertPhoneToID(phonenumber) {
    const splitVal = phonenumber.split("");

    let packedVal;
    let finalarray = []
    for (let i = 0; i < 10;) {

        packedVal = splitVal[i] + splitVal[i + 1];
        finalarray.push(+packedVal)
        i = i + 2;

    }
    return finalarray
}
function createHmacAndBoxParameters(boxid){
    const crypto= require('crypto');
const {Buffer}= require('buffer')


let keys=[]
for(let i=0;i<4;i++){
const temp=Math.floor(Math.random() * 90 + 10);
keys.push(temp)
}
const bufVal= Buffer.from(keys);

;
const result=(boxid.split(""))
let arr1=[]
for(let i=0;i<16;){
  let temp= parseInt((result[i]+result[i+1]),16);
     
   arr1.push(temp);
   i=i+2;
}
const keyBuffer=(Buffer.from(arr1))
const hmac=crypto.createHmac('sha256',keyBuffer)
                .update(bufVal)
                .digest('hex')
const resultHmac=hmac.substr(0,8)
return {keys,resultHmac}
}

module.exports = { convertToObjectID, convertPhoneToID,createHmacAndBoxParameters };