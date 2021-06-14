const DashboardUser = require('../models/dashusers');
const jwt = require('jsonwebtoken');
const Response = require('../utils/Response');
const response = new Response();
let user;

async function protect(req, res, next,) {

    try {
        let auth_token;
        console.log(req.headers.authorization);
        if (req.headers.authorization === "" || req.headers.authorization === undefined || req.headers.authorization === null) {
            throw new Error("Not authorised")

        }
        if (req.headers.authorization.startsWith("Bearer")) {

            auth_token = req.headers.authorization.split(" ")

            auth_token = auth_token[2]

        } else {

            auth_token = req.headers.authorization;
        }

        const tokenVerify = await jwt.verify(auth_token, process.env.sharedkey);
        if (tokenVerify.id) {
            req.user = await DashboardUser.findById(tokenVerify.id)

        }
        if (!req.user.token) {
            throw new Error("Please relogin")
        }



        next();

    } catch (error) {

        return response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
    }
}
function authorize(...roles) {
    return (req, res, next) => {

        try {

            if (!roles.includes(req.user.role)) {
                throw new Error("Not authorised to access resource")
            }


            next();
        } catch (error) {
            return response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }

    };

}


module.exports = { protect, authorize }