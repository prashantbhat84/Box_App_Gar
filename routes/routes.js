
const userRouter = require('./user');
const boxRouter = require('./box')
const utilsRouter = require("./utils")

const express = require('express');

const router = express.Router();


router.use("/v1/user", userRouter);
router.use("/v1/box", boxRouter);
router.use("/v1/utils", utilsRouter)




module.exports = router;