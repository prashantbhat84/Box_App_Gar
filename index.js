
const app = require('./app')
const dotenv = require('dotenv');
const log = require('./utils/serverLogger');
dotenv.config({ path: "./config/config.env" });
const port = process.env.PORT;
app.listen(port, () => {
    log.info({module:"index"},`Server is running on port :${port}`)
})
