const express = require('express');
const userRouter = express.Router();
const { protect, authorize } = require('../middleware/dashboardAuth')

const User = require("../controllers/user");
const user = new User();

userRouter.post("/signup", user.signupUser);
userRouter.put('/verifyUser', user.verifyUser)





module.exports = userRouter;

