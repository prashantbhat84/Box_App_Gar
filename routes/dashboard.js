const express = require('express');
const dashboardRouter = express.Router();
const DashboardUser = require('../controllers/dashboardUser');
const dashboard = new DashboardUser();
const { protect, authorize } = require('../middleware/dashboardAuth')


dashboardRouter.post("/createDashboardUser", protect, authorize("FACTORY-ADMIN"), dashboard.createUser);
dashboardRouter.post("/loginDashboardUser", dashboard.LoginUser);
dashboardRouter.get("/logoutDashboardUser", protect, dashboard.LogoutUser);
dashboardRouter.get("/dashboardUser", protect, authorize("FACTORY-ADMIN"), dashboard.getDashboardUser)
dashboardRouter.put("/deleteUser", protect, authorize("FACTORY-ADMIN"), dashboard.deleteDashboardUser)


module.exports = dashboardRouter;