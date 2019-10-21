const controller = require('../controllers/venue-management')
const utils = require('../utils')

module.exports = (router) => {
	router.route('/venue/add')
		.put(utils.validateToken, utils.verifyAdmin, controller.addVenue)

	router.route('/venues/get-venues')
		.post(utils.validateToken, utils.verifyAdmin, controller.getVenues)

	router.route('/venues/update')
		.put(utils.validateToken, utils.verifyAdmin, controller.updateVenueDetails)
}