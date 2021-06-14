
const userRouter = require('./user');
const boxRouter = require('./box')
const utilsRouter = require("./utils")
const dashboardRouter = require('./dashboard')

const express = require('express');

const router = express.Router();


router.use("/v1/user", userRouter);
router.use("/v1/box", boxRouter);
router.use("/v1/utils", utilsRouter)
router.use("/v1/dashboard", dashboardRouter)




module.exports = router;