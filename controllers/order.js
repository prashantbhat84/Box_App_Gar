const Order = require('../models/order');
const Customer = require('../models/user');
const Box = require("../models/box")
const Response = require('../utils/Response');
const response = new Response();
const { convertToObjectID } = require('../utils/misc')



class Orders {

    async createOrder(req, res, next) {

        try {
            let orderID, custID, order;
            const { name, email, phonenumber, address } = req.body;
            const dt = new Date();
            const tempID = "Gariyasi"
            let customer = await Customer.findOne({ phonenumber: req.body.phonenumber });
            let box;
            if (req.body.boxid) {
                box = await Box.findOne({ boxid: req.body.boxid });

                if (!box) {
                    throw new Error(`BoxID does not exist. Please create an entry in box table`)
                }

            }

            const orders = await Order.find();


            if (orders.length === 0) {

                orderID = `${tempID}-1`;

            } else {

                orderID = `${tempID}-${(+orders.reverse()[0].OrderID.split("-")[1]) + 1}`;
            }
            if (customer) {
                custID = convertToObjectID(customer._id);
            } else {
                customer = await Customer.create({ name, email, phonenumber, address });
                custID = convertToObjectID(customer._id);
            }
            if (box.orderid !== undefined) {
                throw new Error("This box is already assigned to a order")
            }

            if (req.body.boxid) {

                order = await Order.create({
                    customer: custID,
                    OrderID: orderID,
                    Box: req.body.boxid
                })
            } else {
                order = await Order.create({
                    customer: custID,
                    OrderID: orderID

                })
            }
            await Box.updateOne({ _id: box._id }, { orderid: order._id, boxStatus: "WAREHOUSE" })

            response.successReponse({ status: 201, result: order, res })



        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })

        }
    }
    async listOrders(req, res, next) {
        try {
            const pageNo = +req.query.pageNo || 0;
            const itemsPerPage = +req.query.itemsPerPage || 1;
            const orderCOunt = await Order.countDocuments();
            const filteredOrder = await Order.find().skip(pageNo * itemsPerPage).limit(itemsPerPage)
            response.successReponse({ status: 200, result: { count: orderCOunt, Orders: filteredOrder }, res })
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
}


module.exports = Orders