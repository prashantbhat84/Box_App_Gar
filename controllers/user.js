const userModel = require('../models/user');


class User {

    async createUser(req, res, next) {
        try {

            response.successReponse({ status: 201, result: "User Created", res })
        } catch (error) {

        }
    }
}

module.exports = User;