const express = require('express');

const customerRouter = require('./customer');
const utils = require('../controllers/utils');
const utilsRouter = express.Router();



utilsRouter.get("/secretkey", utils.getSecret)
utilsRouter.get("/box", utils.getBoxDateInfo);



module.exports = utilsRouter;
