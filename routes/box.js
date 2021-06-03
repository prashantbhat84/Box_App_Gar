
const express = require('express');
const boxRouter = express.Router();
const Box = require('../controllers/box.js');
const boxController = new Box();



boxRouter.post("/create", boxController.createBox)
boxRouter.get("/list", boxController.listBoxes)
boxRouter.put("/update", boxController.updateBox)
boxRouter.get("/fetch", boxController.getBox)



module.exports = boxRouter;
