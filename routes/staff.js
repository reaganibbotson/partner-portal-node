// ---- STAFF MANAGEMENT ----
// Add staff
// Login staff
// Get list of staff (admins only)
// Get individual staff data (staff details page)
// Change staff password
// Delete staff
// Update own details


const controller = require('../controllers/staff')
const utils = require('../utils')

module.exports = (router) => {
	router.route('/add-staff')
		.post(utils.verifyAdmin, controller.addStaff)

	router.route('/login-staff')
		.post(controller.loginStaff)

	router.route('/staff-list/:username')
		.get(utils.verifyAdmin, controller.listStaff)
}