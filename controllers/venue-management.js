// ---- VENUE MANAGEMENT ----
// Create venue
// Get list of venues
// Update venue details

const knex = require('knex')
const config = require('../config')

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL || config.dbURI,
    ssl: true,
  }
});


module.exports = {
	addVenue: (req, res) => {
		const { venueID, venueName, address, suburb, state, postcode, fromText, venueType, barcode } = req.body.venueData

		db.raw(`
			insert into venues (venue_id, name, address, suburb, state, postcode, from, venue_type, barcode)
			values (${venueID}, ${venueName}, ${address}, ${suburb}, ${state}, ${postcode}, ${fromText}, ${venueType}, ${barcode})
		`)
		.then(data => {
			res.status(200).send(data.rows)
		})
		.catch(err=>{
			res.status(400).send(err)
		})
	},

	getVenues: (req, res) => {
		db.raw(`
			select 
				* 
			from venues
		`)
		.then(data => {
			res.status(200).send(data.rows)
		})
		.then(err=>{
			res.status(400).send(err)
		})
	},

	updateVenueDetails: (req, res) => {
		const { venueID, venueName, address, suburb, state, postcode, fromText, venueType, barcode } = req.body.venueData

		db.raw(`
			update venues
			set 
				venue_id = ${venueID}, 
				name = ${venueName}, 
				address = ${address}, 
				suburb = ${suburb}, 
				state = ${state}, 
				postcode = ${postcode}, 
				from = ${fromText}, 
				venue_type = ${venueType}, 
				barcode = ${barcode}
		`)
		.then(data => {
			res.status(200).send(data.rows)
		})
		.catch(err => {
			console.log(err)
			res.status(500).send('Unable to update venue.')
		})
	},

	
}