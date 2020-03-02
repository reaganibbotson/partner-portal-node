// ---- VENUE DATABASE MANAGEMENT ----
// Add player
// Edit player account
// Allow venue to scan barcodes
	// Barcode format is:
		// Venue ID -- padded to fixed length (4)
		// Player ID -- padded to fixed length (6)
		// Month-Year of mailout promo -- fixed length (4)
		// Week of promo (1-4) -- fixed length (1)

const controller = require('../controllers/venue-db-management')
const utils = require('../utils')

module.exports = (router) => {
	router.route('/vendb/addPlayer')
		.post(utils.validateToken, controller.addPlayer)

	
}