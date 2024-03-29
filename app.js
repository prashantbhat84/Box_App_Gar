const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv')
const Response = require('./utils/Response')
const morgan = require('morgan');
const pug = require('pug')
const path = require('path')
const connectdb = require('./config/db')
const router1 = require('./routes/routes')
// const crypto = require('crypto');
// const hash = crypto.createHash('A')

const response = new Response()
global.response = response;

dotenv.config({ path: "./config/config.env" });
const port = process.env.PORT;
connectdb();
global.express = express;
const { errorResponse } = response
const corsOptions = {
    origin: "*",
    methods: ["POST", "GET", "PUT"]
}
const app = express();
app.use(express.json())
app.use(cors(corsOptions));
app.use((req, res, next) => {
    // console.log(req.hostname, req.headers, req.path);

    const allowedMethods = ["POST", "GET", "PUT"];
    if (!allowedMethods.includes(req.method)) {
        errorResponse({ status: 400, result: `${req.method} method is not allowed`, res })

    }
    next();
})

app.set("views", path.join(__dirname, 'views'));
app.set('view engine', pug);
app.get("/", (req, res) => {
    res.send('Server is Running')
})

app.use("/api", router1);




process.on("uncaughtException", (req, res) => {

    // process.exit(1);
    errorResponse({ status: 400, result: "Process exited due to unhandled exception", res })
});
// app.listen(port, () => {
//     console.log(`Server is listening on port ${port}`);
// })

module.exports = app;