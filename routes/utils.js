const express = require('express');
const Utils = require('../controllers/utils');
const customerRouter = require('./customer');
const utils = new Utils();
const utilsRouter = express.Router();



utilsRouter.get("/secretkey", utils.getSecret)
utilsRouter.get("/box", utils.getBoxDateInfo);



module.exports = utilsRouter;
