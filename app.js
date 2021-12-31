const express = require('express');
const router= express.Router();
const cors = require('cors')
const dotenv = require('dotenv');
const http= require('http')
const app = express();
const server=http.createServer(app); 
global.io= require('socket.io')(server);



io.on("connection",socket=>{
  socket.emit("80575a5a286d04",{box:"RESET"});
  socket.disconnect();
})

const hbs= require('handlebars')
const pdf = require('html-pdf')
const path = require('path')
const connectdb = require('./config/db')
const router1 = require('./routes/routes');
const log= require('./utils/serverLogger');
const response= require("./utils/Response");

const cron= require('node-cron');
const {boxJob,aggregatorJob,updateBoxAndAggregator}= require('./jobs/Jobs')
// const crypto = require('crypto');
// const hash = crypto.createHash('A')
// every one minute  cron jobs
// cron.schedule('*/1 * * * *',boxJob)
cron.schedule('*/1 * * * *',aggregatorJob)
// detect if memory leak is present in your app
// setInterval(()=>{
//     const util= require('util')
   
//     log.info(util.inspect(process.memoryUsage()))
// },5000)



const config = {
    title: 'Express Status',
    path: '/server',
    spans: [{
      interval: 1,
      retention: 60
    }, {
      interval: 5,
      retention: 60
    },{
        interval: 3600,
        retention: 60
      }],
    chartVisibility: {
      cpu: true,
      mem: true,
      load: true,
      responseTime: true,
      rps: true,
      statusCodes: true
    },
    // healthChecks: [
    //   {
    //     protocol: 'http',
    //     host: 'localhost',
    //     path: '/admin/health/ex1',
    //     port: '3000'
    //   }
    // ],
    ignoreStartsWith: '/admin'
  }


dotenv.config({ path: "./config/config.env" });
const port = process.env.PORT;
connectdb();

global.express = express;
const { errorResponse } = response
const corsOptions = {
    origin: "*",
    methods: ["POST", "GET", "PUT"]
}

// app.use(require('express-status-monitor')(config))
app.use(express.json())

app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(req.path)

    const allowedMethods = ["POST", "GET", "PUT"];
    if (!allowedMethods.includes(req.method)) {
        errorResponse({ status: 400, result: `${req.method} method is not allowed`, res })

    }
    next();
})

app.get("/", (req, res) => {
   
    res.send('Server is up and running on http port')
})

app.use("/api", router1);





// process.on("uncaughtException", (req, res) => {

//     // process.exit(1);
//     errorResponse({ status: 400, result: "Process exited due to unhandled exception", res })
// });


module.exports = app;