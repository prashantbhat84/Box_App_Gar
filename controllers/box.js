const multichainNode = require('multichain-node')
const boxModel = require('../models/box')

// const response = new Response();
// const { AsyncDebugger } = require('../lib/async-debugger');

// const asyncDebugger = new AsyncDebugger();
class Box {
    constructor() {

    }

    async createBox(req, res, next) {

        try {
            const dt = new Date()

            req.body.lastUpdated = `${dt.getHours()}:${dt.getMinutes()}`

            const newBox = await boxModel.create(req.body);

            await multichain.issue({
                address: process.env.blockchainaddress, qty: 1, units: 1, details: req.body, asset: {
                    name: req.body.boxid,
                    open: true
                }
            })
            response.successReponse({ status: 201, result: newBox, res })
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })

        }
    }
    async listBoxes(req, res, next) {
        try {
            const boxList = await boxModel.find();
            response.successReponse({ status: 200, result: boxList, res })
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
            const box = await boxModel.findOne({ boxid: req.query.boxid });
            if (box === null) {
                throw new Error("Box Not found Please check the box id")
            }
            // response.successReponse({ status: 200, result: box, res })

        } catch (error) {
            response.errorResponse({ status: 400, result: error.message, res })
        }
    }

}

module.exports = Box