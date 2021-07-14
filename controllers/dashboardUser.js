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

            const users = await DashboardUser.find({ role: "BOOKING-ADMIN" })

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


}
module.exports = dashBoardUser;