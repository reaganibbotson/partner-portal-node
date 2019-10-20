const controller = require('../controllers/venue-management')
const utils = require('../utils')

module.exports = (router) => {
	router.route('add-venue')
		.post(utils.validateToken, utils.verifyAdmin, controller.addVenue)

	router.route('get-venues')
		.post(utils.validateToken, utils.verifyAdmin, controller.getVenues)
}