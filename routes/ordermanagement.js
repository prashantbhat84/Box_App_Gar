const express = require('express');
const orderManagementRouter = express.Router();
const Box = require('../controllers/box.js');
const boxController = new Box();



orderManagementRouter.post("/create", boxController.createBox)
orderManagementRouter.get("/list", boxController.listBoxes)
orderManagementRouter.put("/update", boxController.updateBox)
orderManagementRouter.get("/fetch", boxController.getBox)



module.exports = boxRouter;
