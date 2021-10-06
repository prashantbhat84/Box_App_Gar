
const express = require('express');
const boxRouter = express.Router();
const boxController= require('../controllers/box')
const { protect, authorize } = require('../middleware/dashboardAuth')



boxRouter.post("/create", protect, authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]), boxController.createBox)
boxRouter.get("/list", protect, authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]), boxController.listBoxes)
boxRouter.put("/update", boxController.updateBox)
boxRouter.get("/fetch", protect, authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]), boxController.getBox)
boxRouter.post("/log", boxController.logBox);






module.exports = boxRouter;
