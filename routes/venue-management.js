// ---- VENUE MANAGEMENT ----
// Create venue
// Get list of venues
// Update venue details

const controller = require('../controllers/venue-management')

module.exports = (router) => {
	router.route('add-venue')
		.post(controller.addVenue)
}