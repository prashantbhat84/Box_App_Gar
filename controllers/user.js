const UserModel = require('../models/user');


class User {

    async createUser(req, res, next) {

        try {
            const newUser = await UserModel.create(req.body);

            response.successReponse({ status: 201, result: newUser, res })
        } catch (error) {

        }
    }
}

module.exports = User;