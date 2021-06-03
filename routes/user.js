const express = require('express');
const userRouter = express.Router();

const User = require("../controllers/user");
const user = new User();

userRouter.post("/create", user.createUser);





module.exports = userRouter;

