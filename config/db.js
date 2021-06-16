const mongoose = require('mongoose')
global.mongoose = mongoose;
const MultichainConfig = require('./multichainConfig.json');
const multichain = require("multichain-node")(MultichainConfig);
global.multichain = multichain;


const connectdb = async () => {
    try {
        const multichainInfo = await multichain.getInfo();
        await mongoose.connect(`mongodb+srv://${process.env.mongouser}:${process.env.mongopassword}@box-test.ocogl.mongodb.net/gariyasibox?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        console.log("Mongodb Connected")
        console.log(multichainInfo);

    } catch (error) {
        console.log(error.message)

    }

}
module.exports = connectdb;