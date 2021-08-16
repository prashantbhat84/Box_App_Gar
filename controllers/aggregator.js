const Response = require('../utils/Response');
const response = new Response();
const logger = require('../utils/logger');
const AggregatorModel = require("../models/aggregator")

class Aggregator {

    async updateAggregator(req, res, next) {
        try {
            console.log("Aggregator updated")
            console.log(req.body);
            const date = new Date();
            const time = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}:${date.getHours() + 5}-${date.getMinutes() + 30}`

            const aggregator = await AggregatorModel.findOneAndUpdate({ aggregatorID: req.body.id }, { lastUpdatedAt: time }, { new: true, runValidators: true })

            response.successReponse({ status: 200, result: aggregator, res })

        } catch (error) {
            response.errorResponse({ status: 400, result: "Failure", res })
        }
    }
    async updateAggregatorAndBox(req, res, next) {
        try {
            // const data = [14, 30, 59, 20, 224, 2, 36, 0, 2, 112, 164, 224, 79, 88, 75, 24, 35, 12, 77, 98, 43, 21, 79, 34, 83, 70, 50, 70, 50, 22, 23, 153, 10, 32, 21, 755, 'dca632b8f170']
            //  const command= data[12];
            console.log(req.body);
            response.successReponse({ status: 200, result: req.body, res })

        } catch (error) {
            response.errorResponse({ status: 400, result: "Failure", res })
        }
    }
    async createAggregator(req, res, next) {
        try {
            const date = new Date();
            req.body.aggregatorID = req.body.id
            req.body.lastUpdatedAt = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}:${date.getHours()}-${date.getMinutes()}`
            const aggregator = await AggregatorModel.create(req.body)
            response.successReponse({ status: 200, result: aggregator, res })
        } catch (error) {
            response.errorResponse({ status: 400, result: "Failure", res })
        }
    }
};




module.exports = Aggregator