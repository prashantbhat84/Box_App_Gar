const log= require('../utils/serverLogger')
const mongoose = require('mongoose')
global.mongoose = mongoose;
// const MultichainConfig = require('./multichainConfig.json');
// const multichain = require("multichain-node")(MultichainConfig);
// global.multichain = multichain;


const connectdb = async () => {
    try {
       log.info({module:"DB"},'connecting db')
        // const multichainInfo = await multichain.getInfo();
        const db = await mongoose.connect(`mongodb+srv://${process.env.mongouser}:${process.env.mongopassword}@box-test.ocogl.mongodb.net/gariyasibox?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });

        log.info({module:"DB"},'MongoDB connected')
        // console.log(multichainInfo);

    } catch (error) {
        log.error({module:"DB"},'error connecting db')
        log.error({module:"DB"},error.message)

    }

}
module.exports = connectdb;