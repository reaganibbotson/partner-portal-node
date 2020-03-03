const controller = require('../controllers/staff')
const utils = require('../utils')

module.exports = (router) => {
	router.route('/staff/add')
		.post(utils.validateToken, utils.verifyAdmin, controller.addStaff)

	router.route('/staff/login')
		.post(controller.loginStaff)

	router.route('/staff/list')
		.get(utils.validateToken, utils.verifyAdmin, controller.listStaff)

	router.route('/staff/member/:id')
		.get(utils.validateToken, utils.verifyAdmin, controller.getStaffMemberData)

	router.route('/staff/delete')
		.delete(utils.validateToken, utils.verifyAdmin, controller.deleteStaff)

	router.route('/staff/update')
		.put(utils.validateToken, utils.verifyAdmin, controller.updateSelf)

	router.route('/staff/change-password')
		.put(utils.validateToken, utils.verifyAdmin, controller.changePassword)
}