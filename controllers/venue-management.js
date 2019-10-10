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
	addVenue: (req, res)=>{
		// Receive login
		const { username, accessLevel } = req.body.staffData
		const { venueID, venueName, address, suburb, state, postcode, fromText, venueType, barcode } = req.body.venueData

		if(!username || accessLevel != 'Admin'){
			res.status(400).json('Only Admins are allowed to create a new venue.')
		} else {
			db.raw(`
				insert into venues (venue_id, name, address, suburb, state, postcode, from, venue_type, barcode)
				values (${venueID}, ${venueName}, ${address}, ${suburb}, ${state}, ${postcode}, ${fromText}, ${venueType}, ${barcode})
			`)
			.then(data=>{
				res.status(200).json({status: 'success', data: data.rows})
			})
			.catch(err=>{
				res.status(400).json({status: 'fail', data: err})
			})
		}
	},


}