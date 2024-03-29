const multichainNode = require('multichain-node')
const boxModel = require('../models/box')
const logger = require('../utils/logger');




// const response = new Response();
// const { AsyncDebugger } = require('../lib/async-debugger');

// const asyncDebugger = new AsyncDebugger();
class Box {
    constructor() {

    }

    async createBox(req, res, next) {
        console.log('box');
        let customerID;

        try {
            const dt = new Date()

            req.body.lastUpdated = `${dt.getHours()}:${dt.getMinutes()}`

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

                boxList = await boxModel.find().skip(pageNo * itemsPerPage).limit(itemsPerPage)
            } else {
                boxList = await boxModel.find({ boxStatus: filter }).skip(pageNo * itemsPerPage).limit(itemsPerPage)
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



}

module.exports = Box