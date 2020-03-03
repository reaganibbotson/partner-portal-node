// ---- USER MANAGEMENT ----
// Add user to venue
// Get list of users

const controller = require('../controllers/users')
const utils = require('../utils')

module.exports = (router) => {
	router.route('/user/submitMailout')
		.post(utils.validateToken, controller.mailoutSubmission)

	router.route('/user/getCurrentMailouts')
		.get(controller.getCurrentMailouts)

	
}