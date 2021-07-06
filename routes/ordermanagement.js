const express = require('express');
const orderManagementRouter = express.Router();
const Orders = require("../controllers/order")

const orderController = new Orders();
const { protect, authorize } = require("../middleware/dashboardAuth")



orderManagementRouter.post("/create", protect, authorize(["BOOKING-ADMIN"]), orderController.createOrder)
orderManagementRouter.get("/list", protect, authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]), orderController.listOrders)
// orderManagementRouter.put("/update", boxController.updateBox)
// orderManagementRouter.get("/fetch", boxController.getBox)



module.exports = orderManagementRouter;
