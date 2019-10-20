const controller = require('../controllers/staff')
const utils = require('../utils')

module.exports = (router) => {
	router.route('/add-staff')
		.post(utils.validateToken, utils.verifyAdmin, controller.addStaff)

	router.route('/login-staff')
		.post(controller.loginStaff)

	router.route('/staff-list')
		.get(utils.validateToken, utils.verifyAdmin, controller.listStaff)

	router.route('/staff:id')
		.get(utils.validateToken, utils.verifyAdmin, controller.getStaffMemberData)
}