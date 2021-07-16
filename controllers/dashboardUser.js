const DashboardUser = require('../models/dashusers');
const bcrypt = require('bcryptjs')
const Response = require('../utils/Response');
const response = new Response();
const jwt = require('jsonwebtoken')
const { authorize } = require('../middleware/dashboardAuth');
const { convertToObjectID } = require('../utils/misc');



class dashBoardUser {

    async createUser(req, res, next) {
        try {

            const password = req.body.password;

            const salt = await bcrypt.genSalt(10);

            req.body.password = await bcrypt.hash(password, salt);

            const newDashBoardUser = await DashboardUser.create(req.body);
            response.successReponse({ status: 201, result: newDashBoardUser, res })
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async LoginUser(req, res, next) {
        try {
            const email = req.body.email;
            const user = await DashboardUser.findOne({ email });

            if (!user) {

                throw new Error("User with this email does not exist")
            }
            const comparePassword = await bcrypt.compare(req.body.password, user.password);
            if (!comparePassword) {
                throw new Error("Password Mismatch")
            }
            let token = await jwt.sign({ id: user._id }, process.env.sharedkey, { expiresIn: process.env.tokenExpiry });

            token = ` ${token}`;
            const updatedUser = await DashboardUser.findByIdAndUpdate(user._id, {

                token

            }, { new: true, runValidators: true, fields: { password: 0, __v: 0, _id: 0 } });


            response.successReponse({
                status: 200, result: { user: updatedUser }
                , res
            });


        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async LogoutUser(req, res, next) {
        try {

            const objectID = new mongoose.Types.ObjectId(req.user._id);
            const updateUser = await DashboardUser.findByIdAndUpdate(objectID, { token: undefined }, { runValidators: true, new: true });

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
    async getDashboardUser(req, res, next) {
        try {

            const users = await DashboardUser.find({ role: "BOOKING-ADMIN" }).select('-token -password')

            response.successReponse({
                status: 200, result:
                    users
                , res
            });
        } catch (error) {
            console.log(error);
            return response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async deleteDashboardUser(req, res, next) {
        try {
            const { id } = req.body;
            const objectid = convertToObjectID(id);
            const dashboardUser = await DashboardUser.findById(objectid);
            if (!dashboardUser) {
                throw new Error(`User does not exist`)
            }
            await DashboardUser.deleteOne({ "_id": objectid });
            response.successReponse({
                status: 200, result:
                    "User Deletion Successful"
                , res
            })

        } catch (error) {
            console.log(error);
            return response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async forgotPasswordRequest(req, res, next) {
        try {
            const user = await DashboardUser.findOne({ email: req.body.email });
            if (!user) {
                throw new Error("User with this email does not exist")
            }
            // if (user.role === "FACTORY-ADMIN") {
            //     throw new Error("Password Reset not available for this email")
            // }
            const code = (Math.floor(100000 + Math.random() * 900000))
            const updatedUser = await DashboardUser.updateOne({ email: req.body.email }, { forgotPasswordCode: code, token: undefined, password: null });
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
    async checkResetCode(req, res, next) {
        try {
            const { email, code } = req.body;
            const user = await DashboardUser.findOne({ email: req.body.email });
            if (!user) {
                throw new Error("User with this email does not exist")
            }
            if (code !== user.forgotPasswordCode) {
                throw new Error("Invalid Code. Please Retry...")
            }
            await DashboardUser.updateOne({ email }, { forgotPasswordCode: "" });
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
            const user = await DashboardUser.findOne({ email: req.body.email });
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
            await DashboardUser.updateOne({ email }, { password: password1 });
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
module.exports = dashBoardUser;