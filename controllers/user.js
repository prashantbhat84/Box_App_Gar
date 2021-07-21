const UserModel = require('../models/user');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Orders = require('../models/order')
const Box = require("../models/box")
const { convertToObjectID } = require("../utils/misc");
const Notification = require('../models/Notification');


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
            const updatedUser = await UserModel.updateOne({ email: req.body.email }, { forgotPasswordCode: code, token: undefined, });
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
    async addBoxToCustomer(req, res, next) {
        try {
            let user = req.user._id;

            const order = await Orders.findOne({ Box: req.body.boxid });
            const box = await Box.findOne({ boxid: req.body.boxid })
            if (!order) {
                throw new Error("Order details not found . Please contact customer care")
            }
            if (order.customer.toString() !== user.toString()) {
                throw new Error("This box has not been assigned to you. Please contact customer care")
            }
            if (box.primaryOwner) {
                throw new Error("Primary owner for box exists")
            }
            await UserModel.updateOne({ "_id": user }, {
                $addToSet: {
                    box: box.boxid
                }
            });

            await Box.updateOne({ "_id": box._id }, { primaryOwner: user, registrationStatus: "REGISTERED" })

            response.successReponse({
                status: 200, result:
                {
                    AES: box.AESKEY,
                    HMAC: box.HMAC
                }
                , res
            })
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async getCustomerBoxList(req, res, next) {
        try {
            let user = req.user._id;
            const customer = await UserModel.findById(user);
            response.successReponse({
                status: 200, result:
                {
                    list: customer.box
                }
                , res
            })
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async createUserList(req, res, next) {
        try {
            let newUser = await UserModel.findOne({ email: req.body.email, phonenumber: req.body.phonenumber });
            if (!newUser) {
                newUser = await UserModel.create(req.body);
            }

            await UserModel.updateOne({ "_id": req.user._id }, {
                $addToSet: {
                    userlist: newUser
                }
            }, { new: true, runValidators: true })
            //send sms to newuser

            response.successReponse({
                status: 200, result:
                    "User Added Succesfully"
                , res
            })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async getUserList(req, res, next) {
        try {
            const user = await UserModel.findById(req.user._id);

            const list = user.userlist;
            response.successReponse({
                status: 200, result:
                {
                    userList: list
                }
                , res
            })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async removeUserFromList(req, res, next) {
        try {
            const user = await UserModel.findOne(req.user._id);
            const id = req.body.id;
            await UserModel.updateOne({ "_id": user._id }, {
                $pull: {
                    userlist: {
                        "_id": id
                    }
                }
            });


            response.successReponse({
                status: 200, result:
                    "User Removed Successfully"
                , res
            })
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }

    }
    async addSecondaryOwner(req, res, next) {
        try {
            const boxid = req.body.boxid;

            const userBox = await Box.findOne({ boxid });
            if (!userBox) {
                throw new Error("Box Not Found")
            }
            if (req.user._id.toString() !== userBox.primaryOwner.toString()) {
                throw new Error("Only Primary owners  can add additional owners")
            }
            const userId = convertToObjectID(req.body.id);

            const user = await UserModel.findById(userId)
            if (!user) {
                throw new Error("User not found")
            }

            await Notification.create({ userid: userId, description: `${req.user.name} has  requested you to become his box secondary owner`, boxid, senderid: req.user._id })

            response.successReponse({
                status: 200, result:
                    `Have notified ${user.name} of your request to become secondary owner`
                , res
            })
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async getUserNotifications(req, res, next) {
        try {
            const notification = await Notification.find({ userid: req.user._id, expired: false }).select(' -userid -senderid  -createdAt -updatedAt -expired -__v')
            response.successReponse({
                status: 200, result: { notifications: notification }

                , res
            })
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async acceptOwnershipRequest(req, res, next) {
        try {
            const response1 = req.body.response;
            const boxid = req.body.boxid;
            const user = await UserModel.findById(req.user._id)


            const notification = await Notification.findOne({ boxid });
            if (!notification) {
                throw new Error(`Request not found. Please retry ....`)
            }
            if (req.user._id.toString() !== notification.userid.toString()) {
                throw new Error("This request is not for you. Please Verify ....")
            }
            if (!response1) {
                await Notification.updateOne({ "_id": notification._id }, { expired: true, response: "REJECTED" });
                // maybe send sms


            } else {
                await Notification.updateOne({ "_id": notification._id }, { expired: true, response: "ACCEPTED" });
                await Box.updateOne({ boxid }, {
                    $addToSet: {
                        secondaryOwner: user
                    }
                });
                await UserModel.findByIdAndUpdate(req.user._id, {
                    $addToSet: {
                        box: boxid
                    }
                })

            }
            response.successReponse({
                status: 200, result:
                    "Accept Ownership Process Complete"
                , res
            })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async listSecondaryOwner(req, res, next) {
        try {
            const boxid = req.query.boxid;
            const box = await Box.findOne({ boxid });
            if (!box) {
                throw new Error("Box not found")
            }
            if (box.primaryOwner.toString() !== req.user._id.toString()) {
                throw new Error("Secondary Owner List access unauthorised")
            }
            response.successReponse({
                status: 200, result:
                {
                    list: box.secondaryOwner
                }
                , res
            })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async deleteSecondaryOwner(req, res, next) {
        try {
            const boxid = req.body.boxid;
            const id = convertToObjectID(req.body.ownerid);
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error("Secondary owner not found")
            }
            const box = await Box.findOne({ boxid });
            if (!box) {
                throw new Error("Box Not found")
            }

            if (box.primaryOwner.toString() !== req.user._id.toString()) {
                throw new Error("Only primary owner can remove secondary  owner's")
            }

            await Box.updateOne({ "_id": box.id }, {
                $pull: {
                    secondaryOwner: {
                        "_id": id
                    }
                }
            });
            await UserModel.updateOne({ "_id": user._id }, {
                $pull: {
                    box: boxid
                }
            })
            response.successReponse({
                status: 200, result:
                    "Secondary Owner Deletion Process Complete"
                , res
            })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
}

module.exports = User;