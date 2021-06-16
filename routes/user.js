const express = require('express');
const userRouter = express.Router();
const { protect, authorize } = require('../middleware/dashboardAuth')

const User = require("../controllers/user");
const user = new User();

userRouter.post("/create", protect, authorize("BOOKING ADMIN"), user.createUser);





module.exports = userRouter;

