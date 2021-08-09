const Response = require('../utils/Response');
const response = new Response();

class Aggregator {

    async updateAggregator(req, res, next) {
        try {
            console.log("Aggregator updated")
            console.log(req.body);
            response.successReponse({ status: 200, result: req.body, res })

        } catch (error) {
            response.errorResponse({ status: 400, result: "Failure", res })
        }
    }
}

module.exports = Aggregator