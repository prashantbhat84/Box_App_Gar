const express = require('express');
const orderManagementRouter = express.Router();
const Orders = require("../controllers/order")

const orderController = new Orders();
const { protect, authorize } = require("../middleware/dashboardAuth")



orderManagementRouter.post("/create", protect, authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]), orderController.createOrder)
orderManagementRouter.get("/list", protect, authorize(["FACTORY-ADMIN", "BOOKING-ADMIN"]), orderController.listOrders)
orderManagementRouter.put("/cancelOrder", protect, authorize(["FACTORY-ADMIN"]), orderController.cancelOrder)
// orderManagementRouter.put("/update", boxController.updateBox)
orderManagementRouter.put("/dispatchOrder", protect, authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]), orderController.dispatchOrder)
// orderManagementRouter.get("/fetch", boxController.getBox)



module.exports = orderManagementRouter;
