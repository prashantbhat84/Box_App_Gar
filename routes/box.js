
const express = require('express');
const boxRouter = express.Router();
const Box = require('../controllers/box.js');
const boxController = new Box();
const { protect, authorize } = require('../middleware/dashboardAuth')



boxRouter.post("/create", protect, authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]), boxController.createBox)
boxRouter.get("/list", protect, authorize(["BOOKING-ADMIN", "FACTORY-ADMIN"]), boxController.listBoxes)
boxRouter.put("/update", boxController.updateBox)
boxRouter.get("/fetch", boxController.getBox)



module.exports = boxRouter;
