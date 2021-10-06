const express = require('express');
const orderManagementRouter = express.Router();
const orderController = require("../controllers/order")


const { protect, authorize } = require("../middleware/dashboardAuth")



orderManagementRouter.post("/create", protect, authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]), orderController.createOrder)
orderManagementRouter.get("/list", protect, authorize(["FACTORY-ADMIN", "BOOKING-ADMIN"]), orderController.listOrders)
orderManagementRouter.get("/orderDetail",protect,authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]),orderController.getOrderDetails)
orderManagementRouter.put("/cancelOrder", protect, authorize(["FACTORY-ADMIN"]), orderController.cancelOrder)
orderManagementRouter.put("/dispatchOrder", protect, authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]), orderController.dispatchOrder)
orderManagementRouter.get("/getCardInfo", protect, authorize(["FACTORY-ADMIN"]), orderController.getCardInfo)
orderManagementRouter.get("/listDropDown", protect, authorize(["FACTORY-ADMIN", "BOOKING-ADMIN"]), orderController.getOrderDropDown)




module.exports = orderManagementRouter;
