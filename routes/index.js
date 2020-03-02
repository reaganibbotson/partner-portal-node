const mailouts = require('./mailouts')
const staff = require('./staff')
const users = require('./users')
const venueDB = require('./venue-db-management')
const venue = require('./venue-management')

module.exports = (router) => {
	
	router.route('/')
		.get((req, res) => {
			res.send('Connected babyyy')
		})

	staff(router)
	// users(router)
	venue(router)
	venueDB(router)
	mailouts(router)
	return router
}