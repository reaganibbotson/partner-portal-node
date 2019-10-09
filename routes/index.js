const mailouts = require('./mailouts')
const staff = require('./staff')
const users = require('./users')
const venueDB = require('./venue-db-management')
const venue = require('./venue')

module.exports = (router) => {
	mailouts(router),
	staff(router),
	users(router),
	venueDB(router),
	venue(router),
	return router
}