
const userRouter = require('./user');
const boxRouter = require('./box')
const utilsRouter = require("./utils")
const dashboardRouter = require('./dashboard')
const orderRouter = require('./ordermanagement')

const express = require('express');

const router = express.Router();


router.use("/v1/user", userRouter);
router.use("/v1/box", boxRouter);
router.use("/v1/utils", utilsRouter)
router.use("/v1/dashboard", dashboardRouter)
router.use("/v1/order", orderRouter)




module.exports = router;