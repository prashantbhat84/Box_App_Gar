const express = require('express');
const Aggregator = require("../controllers/aggregator");
const aggregatorRouter = express.Router();
const aggregator = new Aggregator();

aggregatorRouter.post("/updateAggregator", aggregator.updateAggregator);

module.exports = aggregatorRouter;


