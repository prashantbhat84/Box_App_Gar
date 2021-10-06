const Order = require('../models/order');
const Customer = require('../models/user');
const Box = require("../models/box")
const response = require('../utils/Response');
const { convertToObjectID } = require('../utils/misc');
const log = require('../utils/serverLogger');



class Orders {
    constructor () {
        if(!Orders.instance){
            Orders.instance =this;
        }
           return Orders.instance;
    }

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
            const filterOrderBy=req.query.filterOrder;
            let orderCount, filteredOrder;
            if (req.user.role === "BOOKING-ADMIN") {
                filteredOrder = await Order.find({ orderStatus: "WAREHOUSE" }).populate('customer','name -_id').skip(pageNo * itemsPerPage).limit(itemsPerPage)
                orderCount = await Order.countDocuments({ orderStatus: "WAREHOUSE" });
            }
            if(req.user.role="FACTORY-ADMIN"){
               switch(filterOrderBy){
                   case "DISPATCHED":
                        filteredOrder = await Order.find({ orderStatus: "DISPATCHED" }).populate('customer','name -_id').skip(pageNo * itemsPerPage).limit(itemsPerPage)
                        orderCount = await Order.countDocuments({ orderStatus: "DISPATCHED" });
                        break;
                   case "CANCELLED":
                        filteredOrder = await Order.find({ orderStatus: "CANCELLED" }).populate('customer','name -_id').skip(pageNo * itemsPerPage).limit(itemsPerPage)
                        orderCount = await Order.countDocuments({ orderStatus: "CANCELLED" });
                        break; 
                    case "WAREHOUSE": 
                        filteredOrder = await Order.find({ orderStatus: "WAREHOUSE" }).populate('customer','name -_id').skip(pageNo * itemsPerPage).limit(itemsPerPage)
                        orderCount = await Order.countDocuments({ orderStatus: "WAREHOUSE" });
                        break;
                    default:
                        filteredOrder = await Order.find().populate('customer','name -_id').skip(pageNo * itemsPerPage).limit(itemsPerPage)
                        orderCount = await Order.countDocuments();
               }
            } 
          
         
            response.successReponse({ status: 200, result: { count: orderCount, Orders: filteredOrder }, res })
        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async getOrderDetails(req,res,next){
        try {
            if(!req.query.order){
                throw new Error("Order ID is mandatory");               
            }
           
          
            const orderDetail=  await Order.findOne({OrderID:req.query.order}).populate('customer','name email address phonenumber address -_id');

            response.successReponse({ status: 200, result: orderDetail, res })

        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }

 
    
    async dispatchOrder(req, res, next) {
        try {

            const order = await Order.findOne({ OrderID: req.body.OrderID });

            if (!order) {
                throw new Error(`Order with ID ${req.body.OrderID} does not exist`)
            }
            if (order.orderStatus === "DISPATCHED" || order.orderStatus === "CANCELLED") {
                throw new Error(`Order with ID ${req.body.OrderID} has been dispatched or cancelled`)
            }
            const dispatch = await Order.updateOne({ OrderID: req.body.OrderID }, { orderStatus: "DISPATCHED", courierName: req.body.courierName, docketNo: req.body.docketNo }, { new: true, runValidators: true })
            await Box.findOneAndUpdate({ boxid: order.Box }, { boxStatus: "DISPATCHED" }, { new: true, runValidators: true })
            dispatch.OrderID = req.body.OrderID
            response.successReponse({ status: 200, result: dispatch, res })


        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async cancelOrder(req, res, next) {
        try {

            const order = await Order.findOne({ OrderID: req.body.OrderID });

            if (!order) {
                throw new Error(`Order with ID ${req.body.OrderID} does not exist`)
            }
            if (order.orderStatus === "DISPATCHED" || order.orderStatus === "CANCELLED") {
                throw new Error(`Order with ID ${req.body.OrderID} has been dispatched or cancelled`)
            }
            const cancel = await Order.updateOne({ OrderID: req.body.OrderID }, { orderStatus: "CANCELLED" }, { new: true, runValidators: true })
            await Box.findOneAndUpdate({ boxid: order.Box }, { orderid: undefined }, { new: true, runValidators: true })
            cancel.OrderID = req.body.OrderID

            response.successReponse({ status: 200, result: { cancel }, res })


        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
    async getCardInfo(req, res, next) {

        try {

            const totalBoxes = await Box.countDocuments();

            const warehouseBoxes = await Box.countDocuments({ boxStatus: "WAREHOUSE" });
            const dispatchedBoxes = totalBoxes - warehouseBoxes;
            const totalOrders = await Order.countDocuments();
            const dispatchedOrders = await Order.countDocuments({ orderStatus: "DISPATCHED" })
            const wareHouseOrders = await Order.countDocuments({ orderStatus: "WAREHOUSE" })
            const cancelledOrders = await Order.countDocuments({ orderStatus: "CANCELLED" })
            const resultObj = {
                totalBoxes, warehouseBoxes, dispatchedBoxes, totalOrders, dispatchedOrders, wareHouseOrders, cancelledOrders
            }
            response.successReponse({ status: 200, result: resultObj, res })

        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }

    }
    async getOrderDropDown(req, res, next) {
        try {

            const resultObj = await Order.find({ orderStatus: "WAREHOUSE" }).select('OrderID -_id')
            response.successReponse({ status: 200, result: resultObj, res })

        } catch (error) {
            response.errorResponse({ status: 400, errors: error.stack, result: error.message, res })
        }
    }
}
const orderController= new Orders();
Object.freeze(orderController);

module.exports = orderController;