const express = require('express');
const userRouter = express.Router();
const { protect, authorize } = require("../middleware/Customer")
const { protect:dashboardProtect, authorize: dashboardAuth } = require("../middleware/dashboardAuth")

const user = require("../controllers/user");

userRouter.post("/signup", user.signupUser);

userRouter.put('/verifyUser', user.verifyUser)
userRouter.post("/login", user.userLogin)
userRouter.get("/logout", protect, user.Logout)
userRouter.post("/forgotPassword", user.forgotPassword)
userRouter.put("/verifyCode", user.verifyPasswordCode)
userRouter.put("/changePassword", user.changePassword)
userRouter.put("/addBox", protect, user.addBoxToCustomer)
userRouter.get("/boxList", protect, user.getCustomerBoxList)
userRouter.post("/createUserList", protect, user.createUserList);
userRouter.get("/getUserList", protect, user.getUserList)
userRouter.put("/removeUserFromList", protect, user.removeUserFromList)
userRouter.post("/addAsSecondaryOwner", protect, user.addSecondaryOwner)
userRouter.get("/getUserNotification", protect, user.getUserNotifications)
userRouter.put("/acceptOwnershipRequest", protect, user.acceptOwnershipRequest)
userRouter.get("/listSecondaryOwner", protect, user.listSecondaryOwner)
userRouter.put("/deleteSecondaryOwner", protect, user.deleteSecondaryOwner)
userRouter.get("/fetchUser",dashboardProtect,dashboardAuth(["FACTORY-ADMIN", "BOOKING-ADMIN"]),user.fetchUser)







module.exports = userRouter;

