const express = require('express');
const Aggregator = require("../controllers/aggregator");
const aggregatorRouter = express.Router();
const aggregator = new Aggregator();
const { protect, authorize } = require('../middleware/dashboardAuth')

aggregatorRouter.post("/updateAggregator", aggregator.updateAggregator);
aggregatorRouter.put("/updateAggregatorAndBox", aggregator.updateAggregatorAndBox);
aggregatorRouter.post("/createAggregator", protect, authorize("FACTORY-ADMIN"), aggregator.createAggregator);

module.exports = aggregatorRouter;


