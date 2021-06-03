const mongoose = require('mongoose')
global.mongoose = mongoose


const connectdb = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.mongouser}:${process.env.mongopassword}@box-test.ocogl.mongodb.net/gariyasibox?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        console.log("Mongodb Connected")

    } catch (error) {
        console.log(error.message)

    }

}
module.exports = connectdb;