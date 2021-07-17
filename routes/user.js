const express = require('express');
const userRouter = express.Router();
const { protect, authorize } = require("../middleware/Customer")

const User = require("../controllers/user");
const user = new User();

userRouter.post("/signup", user.signupUser);

userRouter.put('/verifyUser', user.verifyUser)
userRouter.post("/login", user.userLogin)
userRouter.get("/logout", protect, user.Logout)
userRouter.post("/forgotPassword", user.forgotPassword)
userRouter.put("/verifyCode", user.verifyPasswordCode)
userRouter.put("/changePassword", user.changePassword)
userRouter.put("/addBox", protect, user.addBoxToCustomer)
userRouter.get("/boxList", protect, user.getCustomerBoxList)






module.exports = userRouter;

