const Order = require('../models/order');


class Orders {

    async createOrder(req, res, next) {
        try {
            let orderID;
            const dt = new Date();
            const tempID = `${dt.getDay()}-${dt.getTime()}`
            const orders = await Order.find();
            if (orders.length === 0) {

                orderID = `${tempID}-1`;
            }

            orderID = `${tempID}-${(+orders.reverse()[0].OrderID.split("-")[2]) + 1}`;


        } catch (error) {

        }
    }
}