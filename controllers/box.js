const multichainNode = require('multichain-node')
const boxModel = require('../models/box')
const logger = require('../utils/logger');
const userModel = require("../models/user")
const utils = require("./utils");
const response = require('../utils/Response');
const { convertToObjectID } = require('../utils/misc');





// const response = new Response();
// const { AsyncDebugger } = require('../lib/async-debugger');

// const asyncDebugger = new AsyncDebugger();
class Box {
    constructor() {
        if (!Box.instance) {
            Box.instance = this;
        }
        return Box.instance;
    }

    async createBox(req, res, next) {

        let customerID;

        try {
            const dt = new Date()

            req.body.lastUpdated = `${dt.getHours()}:${dt.getMinutes()}`

            const secret = utils.getSecret(req.body.boxid)
            req.body.AESKEY = secret.aeskey;
            req.body.HMAC = secret.hmac
            const newBox = await boxModel.create(req.body);



            // await multichain.issue({
            //     address: process.env.blockchainaddress, qty: 1, units: 1, details: req.body, asset: {
            //         name: req.body.boxid,
            //         open: true
            //     }
            // })
            response.successReponse({ status: 201, result: newBox, res })
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })

        }
    }
    async listBoxes(req, res, next) {
        try {
            const pageNo = +req.query.pageNo || 0;
            const itemsPerPage = +req.query.itemsPerPage || 10;
            const filter = req.query.status
            const boxCount = await boxModel.countDocuments();
            let boxList;
            if (!filter) {

                boxList = await boxModel.find().populate('orderid', "OrderID -_id ").skip(pageNo * itemsPerPage).limit(itemsPerPage)
            } else {
                boxList = await boxModel.find({ boxStatus: filter }).populate('orderid', 'OrderID -_id').skip(pageNo * itemsPerPage).limit(itemsPerPage)
            }
            response.successReponse({ status: 200, result: { count: boxCount, Boxes: boxList }, res })
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })

        }

    }
    async updateBox(req, res, next) {
        try {
            const date = new Date()
            const lastUpdated = `${date.getHours()}:${date.getMinutes()}`
            const boxUpdate = await boxModel.findOneAndUpdate({ boxid: req.query.boxid, }, { lastUpdated }, { new: true, runValidators: true })
            response.successReponse({ status: 200, result: boxUpdate, res })



        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async getBox(req, res, next) {
        try {
            let customer;
            const Order = require("../models/order");
            const User = require('../models/user')
            const box = await boxModel.findOne({ boxid: req.query.boxid });

            if (box === null) {
                throw new Error("Box Not found Please check the box id")
            }
            if (box['orderid']) {

                const orderDetails = await Order.findById(box.orderid);

                customer = await User.findById(orderDetails.customer, 'name email phonenumber address');


            }
            if (!customer) {
                customer = "No order assigned to this box"
            }

            response.successReponse({ status: 200, result: customer, res })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }
    async logBox(req, res, next) {

        try {
            console.log('logbox');
            const { msg, boxid } = req.body
            logger.info(msg, boxid);

            res.status(200).json({ success: true })
        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }

    }
    async boxFactoryReset(req, res, next) {
        try {
            let userId = req.user._id;
            const boxid = req.body.boxid;
            const box = await boxModel.findOne({ boxid });
            if (box.primaryOwner.toString() !== userId.toString()) {
                throw new Error("Only Primary owner can reset the box")
            };

            await userModel.updateMany({
                box: {
                    $in: [boxid]
                }
            }, {
                $pull: {
                    box: boxid
                }
            })

            await boxModel.updateOne({ _id: box._id }, {
                $unset: { primaryOwner: convertToObjectID(userId) },
                $set: { secondaryOwner: [] },
                boxStatus: "FACTORY-RESET"
            });
            response.successReponse({ status: 200, result: "Box Factory Reset Complete", res })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }

    }




}
const boxController = new Box();
Object.freeze(boxController)

module.exports = boxController