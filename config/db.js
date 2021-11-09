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
         await mongoose.connect(`mongodb+srv://${process.env.mongouser}:${process.env.mongopassword}@box-test.ocogl.mongodb.net/gariyasibox?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        //  await mongoose.connect(`mongodb+srv://${process.env.mongouser}:${process.env.mongopassword}@box-test.ocogl.mongodb.net/gariyasibox?retryWrites=true&w=majority`, {
            log.info({module:"DB"},'MongoDB connected')
        
        mongoose.connection.on('error',(err)=>{
             mongoose.connection.close();
            log.info({module:"DB"},`MongoDB connection Error: ${err}`)
        });
      
        mongoose.connection.on('disconnected',()=>{
                 mongoose.connection.close()
            log.info({module:"DB"},'MongoDB disconnected')
        });
        process.on("SIGINT",()=>{
            mongoose.connection.close();
            log.info({module:"DB"},'MongoDB disconnected');
            process.exit(0);
        })


        // console.log(multichainInfo);

    } catch (error) {
        log.error({module:"DB"},'error connecting db')
        log.error({module:"DB"},error.message)

    }

}
module.exports = connectdb;