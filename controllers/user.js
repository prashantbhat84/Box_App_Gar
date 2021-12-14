const UserModel = require('../models/user');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Orders = require('../models/order')
const Box = require("../models/box")
const { convertToObjectID, convertPhoneToID } = require("../utils/misc");
const Notification = require('../models/Notification');
const awsInstance = require('../utils/awsfunctions');
const response = require('../utils/Response')
const { forgotPassword, verifyemail } = require('../utils/mailcontent')
const log = require("../utils/serverLogger")


class User {

    constructor() {
        if (!User.instance) {
            User.instance = this;
        }

        return User.instance;
    }
       /**
     * 
     * @method POST
     *  @route /api/v1/user/signup
     * @protected NO
     * @description used to signup customer 
     */

    async signupUser(req, res, next) {

        try {

            const user = await UserModel.findOne({
                phonenumber: req.body.phonenumber,
                email:req.body.email.toLowerCase()
            });
            if (!user) {
                throw new Error("Please Enter the email & phonenumber submitted during order placement")
            }
            let phoneVerify = Math.floor(100000 + Math.random() * 900000);
            let emailVerify = Math.floor(100000 + Math.random() * 900000);
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
            await UserModel.updateOne({ phonenumber: user.phonenumber }, { phoneVerify, emailVerify, password: req.body.password });
            await verifyemail(req.body.email, emailVerify)
            await awsInstance.smsaws(user.phonenumber, `Please enter the code ${phoneVerify} to verify your phone`)
            // sms  and email to be sent

            response.successReponse({ status: 201, result: "Please check your email and mobile for verification codes", res })
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
     /**
     * 
     * @method PUT
     *  @route /api/v1/user/verifyUser
     * @protected NO
     * @description used to verify customer details after signup 
     */
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

     /**
     * 
     * @method POST
     *  @route /api/v1/user/login
     * @protected NO
     * @description Customer Login
     */
    async userLogin(req, res, next) {
        try {
           
            const user =(await UserModel.findOne({ email:req.body.email.toLowerCase() }))
            let boxes;
            
       

          
           
            if (!user) {
                throw new Error("Email or password does not match")
            }
            if(user.box){
                boxes= await Box.find({
                    boxid:{
                        $in:user.box
                    }
                },{boxid:1,keys:1, label:1,_id:0}) ;
                
            }

            if (user.userverified === false) {
                throw new Error("Please verify  your email & phonenumber")
            }
            const comparePassword = await bcrypt.compare(req.body.password, user.password);
            if (!comparePassword) {
                throw new Error("Password Mismatch")
            }
            const apptoBoxID = convertPhoneToID(user.phonenumber);
            let token = await jwt.sign({ id: user._id }, process.env.sharedkey, { expiresIn: process.env.tokenExpiry });
            const updatedUser = await UserModel.findByIdAndUpdate(user._id, {

                token, apptoBoxID

            }, { new: true, runValidators: true, fields: { password: 0, __v: 0, _id: 0, emailVerify: 0, phoneVerify: 0, userlist: 0, primarybox: 0, secondarybox: 0, forgotPasswordCode: 0,box:0 } });
                
               

            response.successReponse({
                status: 200, result: { user: updatedUser,boxes }
                , res
            });
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
     /**
     * 
     * @method GET
     *  @route /api/v1/user/logout
     * @protected YES
     * @description customer logout
     */
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
     /**
     * 
     * @method POST
     *  @route /api/v1/user/forgotPassword
     * @protected NO
     * @description request for password reset code via email
     */
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
            await forgotPassword(req.body.email, code)
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
  // Function not in use
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
     /**
     * 
     * @method PUT
     *  @route /api/v1/user/changepassword
     * @protected NO
     * @description change customer password 
     */
    async changePassword(req, res, next) {
        try {
            const { email, password, confirmPassword,code } = req.body;
            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                throw new Error("User with this email does not exist")
            }
            if (password !== confirmPassword) {
                throw new Error("Password and confirm password must be same")
            }
            if (code !== user.forgotPasswordCode) {
                throw new Error("Invalid Code. Please Retry...")
            }
            if (user.password !== null && (user.forgotPasswordCode !== "")) {
                throw new Error("Please follow proper password reset steps")
            }
            const salt = await bcrypt.genSalt(10);
            const password1 = await bcrypt.hash(password, salt);
            await UserModel.updateOne({ email }, { password: password1,forgotPasswordCode:"" });
            response.successReponse({
                status: 200, result:
                    "Password Changed Successfully"
                , res
            })

        } catch (error) {
           
            return response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
     /**
     * 
     * @method PUT
     *  @route /api/v1/user/addBox
     * @protected YES
     * @description Become the primary owner of the box
     */
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
                },

            });

            await Box.updateOne({ "_id": box._id }, { primaryOwner: user, registrationStatus: "REGISTERED",boxStatus:"DISPATCHED" })

            response.successReponse({
                status: 200, result:
                {
                    keys:box.keys
                }
                , res
            })
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
     /**
     * 
     * @method GET
     *  @route /api/v1/user/boxList
     * @protected YES
     * @description Get List of Boxes belonging to purticular customer 
     */
    
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
     /**
     * 
     * @method POST
     *  @route /api/v1/user/createUserList
     * @protected YES
     * @description dedicated list of users to be added to the box as sec owner 
     */
    async createUserList(req, res, next) {
        log.info({ module: "Create User List" }, "User List")
        try {
            let newUser = await UserModel.findOne({ email: req.body.email, phonenumber: req.body.phonenumber });
            if (!newUser) {
                req.body.apptoBoxID = convertPhoneToID(req.body.phonenumber.toString());
                newUser = await UserModel.create(req.body);
            }

            await UserModel.updateOne({ "_id": req.user._id }, {
                $addToSet: {
                    userlist: newUser
                }
            }, { new: true, runValidators: true })


            response.successReponse({
                status: 200, result:
                    "User Added Succesfully"
                , res
            })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
     /**
     * 
     * @method GET
     *  @route /api/v1/user/signup
     * @protected YES
     * @description GET dedicated user list
     */
    async getUserList(req, res, next) {
        log.info({ module: "Get User List" }, "User List ")
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
         /**
     * 
     * @method PUT
     *  @route /api/v1/user/signup
     * @protected YES
     * @description remove user from dedicated list
     */
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
         /**
     * 
     * @method POST
     *  @route /api/v1/user/addAsSecondaryOwner
     * @protected YES
     * @access primary owner only
     * @description request user from dedicated list to become  secondary owner
     */
    async addSecondaryOwner(req, res, next) {
        log.info({ module: "Add Secondary Owner" }, "Secondary Owner")
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
               // send sms/email to secondary user
            response.successReponse({
                status: 200, result:
                    `Have notified ${user.name} of your request to become secondary owner`
                , res
            })
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
         /**
     * 
     * @method GET
     *  @route /api/v1/user/getUserNotification
     * @protected YES
     * @description Get Notifications for the logged in user
     */
    async getUserNotifications(req, res, next) {
        try {
            const notification = await Notification.find({ userid: req.user._id,  }).select(' -userid -senderid  -createdAt -updatedAt -expired -__v')
            response.successReponse({
                status: 200, result: { notifications: notification }

                , res
            })
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
         /**
     * 
     * @method PUT
     *  @route /api/v1/user/acceptOwnershipRequest
     * @protected YES
     * @description Accept request by primary onwer to become secondary owner of the box
     */
    async acceptOwnershipRequest(req, res, next) {
        try {
            const response1 = req.body.response;
            const boxid = req.body.boxid;
            const user = await UserModel.findById(req.user._id)
            const box= await Box.findOne({boxid}).populate('primaryOwner');
            
            
                user.apptoBoxID=convertPhoneToID(user.phonenumber);
               

            const notification = await Notification.findOne({ boxid,userid:user._id });
            
            if (!notification) {
                throw new Error(`Request not found. Please retry ....`)
            }
            if (req.user._id.toString() !== notification.userid.toString()) {
                throw new Error("This request is not for you. Please Verify ....")
            }
            // user refused to become owner
            if (!response1) {
                await Notification.deleteOne({ "_id": notification._id });
                // maybe send sms


            } else {
                await Notification.create({boxid,description:`${user.name} has accepted your invitation to become secondary owner`,primaryId:box.primaryOwner.apptoBoxID,secondaryId:user.apptoBoxID,userid:box.primaryOwner._id})
                await Notification.deleteOne({ "_id": notification._id }, { expired: true, response: "ACCEPTED" });
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
                   {
                       message: "Accept Ownership Process Complete",
                       keys:box.keys
                       
                   }
                , res
            })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
         /**
     * 
     * @method GET
     *  @route /api/v1/user/listSecondaryOwner
     * @protected YES
     * @access Primary Owner Only
     * @description List all secondary owners for the box
     */
    async listSecondaryOwner(req, res, next) {
        try {
            const boxid = req.query.boxid;
            const box = await Box.findOne({ boxid });
            if (!box) {
                throw new Error("Box not found")
            }
          log.info(box.primaryOwner)
            if (box.primaryOwner.toString() !== req.user._doc._id.toString()) {
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
         /**
     * 
     * @method PUT
     *  @route /api/v1/user/deleteSecondaryOwner
     * @protected YES
     * @access Primary Owner Only
     * @description Remove a user as secondary owner
     */
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
    async fetchUser(req,res,next){
        try {
            if(!req.query.email){

            throw new Error("Email is required");
            }
            const user=  await UserModel.findOne({email:req.query.email}).select('name email phonenumber address -_id');
            response.successReponse({
                status: 200, result:
                        user
                , res
            })
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async changeUserPassword(req,res,next){
        try {
            let Id= req.user._id;
            Id= convertToObjectID(Id);
            const user = await UserModel.findById(Id);
             let {password,confirmPassword,oldPassword}= req.body;
            if(!password || !confirmPassword || !oldPassword){
                throw new Error("Please enter password,confirm password and old password")
            }
            if(password!==confirmPassword){
                throw new Error("Password and Confirm password must match")
            }
            if(!user){
                throw new Error("User Not Found")
            }
            const comparePassword = await bcrypt.compare(oldPassword, user.password)
            if(!comparePassword){
                throw new Error("Old Password does not Match")
            }
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(req.body.password, salt)
            await UserModel.updateOne({_id:Id},{password,$unset:{
                token:1
            }}

            )
            response.successReponse({
                status: 200, result:
                        "Password Changed. Please relogin"
                , res
            })
            
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
         /**
     * 
     * @method PUT
     *  @route /api/v1/user/labelBox
     * @protected YES
     * @access Primary Owner Only
     * @description Give box a meaningful Name
     */
    async labelBox(req,res,next){
        try {
            const box= await Box.findOne({boxid:req.body.boxid});
            if(!box){
                throw new Error("Box Not Found")
            }
            let user = req.user._id;
            if(box.primaryOwner.toString()!==user.toString()){
                throw new Error("You are not the primary owner of this box")
            }
           const updatedBox=await Box.findOneAndUpdate({boxid:req.body.boxid},{label:req.body.label});
            response.successReponse({
                status: 200, result:
                       updatedBox
                , res
            })
            
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
}

const user = new User();
Object.freeze(user);

module.exports = user;