const UserModel = require('../models/user');


class User {

    async signupUser(req, res, next) {

        try {

            const user = await UserModel.findOne({ email: req.body.email, phonenumber: req.body.phonenumber });

            if (!user) {
                throw new Error("Please Enter the email & phonenumber submitted during order placement")
            }
            let phoneVerify = Math.floor(100000 + Math.random() * 900000);
            let emailVerify = Math.floor(100000 + Math.random() * 900000);

            await UserModel.updateOne({ phonenumber: user.phonenumber }, { phoneVerify, emailVerify, password: 'password123' });

            // sms  and email to be sent

            response.successReponse({ status: 201, result: "Please check your email and mobile for verification codes", res })
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async verifyUser(req, res, next) {
        try {
            const { verifyemail, verifyphone } = req.body
            const user = await UserModel.findOne({ phonenumber: req.body.phonenumber });
            if (!user) {
                throw new Error("User Not Found. Please try again")
            }
            if ((verifyemail !== user.emailVerify) || (verifyphone !== user.phoneVerify)) {
                throw new Error("Email or phone verification unsuccessful")
            }
            await UserModel.updateOne({ phonenumber: req.body.phonenumber }, { userverified: true })

            response.successReponse({ status: 200, result: "User Verification successful", res })
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async userLogin(req, res, next) {

    }
}

module.exports = User;