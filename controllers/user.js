const UserModel = require('../models/user');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


class User {

    async signupUser(req, res, next) {

        try {

            const user = await UserModel.findOne({ email: req.body.email, phonenumber: req.body.phonenumber });

            if (!user) {
                throw new Error("Please Enter the email & phonenumber submitted during order placement")
            }
            let phoneVerify = Math.floor(100000 + Math.random() * 900000);
            let emailVerify = Math.floor(100000 + Math.random() * 900000);
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
            await UserModel.updateOne({ phonenumber: user.phonenumber }, { phoneVerify, emailVerify, password: req.body.password });

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
            await UserModel.updateOne({ phonenumber: req.body.phonenumber }, { userverified: true, emailVerify: "", phoneVerify: "" })

            response.successReponse({ status: 200, result: "User Verification successful", res })
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async userLogin(req, res, next) {
        try {

            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                throw new Error("Email or password does not match")
            }

            if (user.userverified === false) {
                throw new Error("Please verify  your email & phonenumber")
            }
            const comparePassword = await bcrypt.compare(req.body.password, user.password);
            if (!comparePassword) {
                throw new Error("Password Mismatch")
            }
            let token = await jwt.sign({ id: user._id }, process.env.sharedkey, { expiresIn: process.env.tokenExpiry });
            const updatedUser = await UserModel.findByIdAndUpdate(user._id, {

                token

            }, { new: true, runValidators: true, fields: { password: 0, __v: 0, _id: 0, emailVerify: 0, phoneVerify: 0 } });

            response.successReponse({
                status: 200, result: { user: updatedUser }
                , res
            });
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async Logout(req, res, next) {
        try {

            const objectID = new mongoose.Types.ObjectId(req.user._id);
            const updateUser = await UserModel.findByIdAndUpdate(objectID, { token: undefined }, { runValidators: true, new: true }).select('-password');

            response.successReponse({
                status: 200, result:
                    updateUser
                , res
            });
        } catch (error) {
            console.log(error);
            return response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async forgotPassword(req, res, next) {
        try {

            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                throw new Error("User with this email does not exist")
            }
            if (user.userverified === false) {
                throw new Error("Verification Incomplete. Please verify email and mobile number")
            }
            const code = (Math.floor(100000 + Math.random() * 900000))
            const updatedUser = await UserModel.updateOne({ email: req.body.email }, { forgotPasswordCode: code, token: undefined, password: null });
            //send email to user 
            response.successReponse({
                status: 200, result:
                    "Please enter the  code sent to your email"
                , res
            })
        } catch (error) {
            console.log(error);
            return response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async verifyPasswordCode(req, res, next) {
        try {
            const { email, code } = req.body;
            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                throw new Error("User with this email does not exist")
            }
            if (code !== user.forgotPasswordCode) {
                throw new Error("Invalid Code. Please Retry...")
            }
            await UserModel.updateOne({ email }, { forgotPasswordCode: "" });
            response.successReponse({
                status: 200, result:
                    "Please enter new password"
                , res
            })

        } catch (error) {
            console.log(error);
            return response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async changePassword(req, res, next) {
        try {
            const { email, password, confirmPassword } = req.body;
            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                throw new Error("User with this email does not exist")
            }
            if (password !== confirmPassword) {
                throw new Error("Password and confirm password must be same")
            }
            if (user.password !== null && (user.forgotPasswordCode !== "")) {
                throw new Error("Please follow proper password reset steps")
            }
            const salt = await bcrypt.genSalt(10);
            const password1 = await bcrypt.hash(password, salt);
            await UserModel.updateOne({ email }, { password: password1 });
            response.successReponse({
                status: 200, result:
                    "Password Changed Successfully"
                , res
            })

        } catch (error) {
            console.log(error);
            return response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
}

module.exports = User;