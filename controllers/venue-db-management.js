// Add a player
// Edit a player
// Delete a player
// 

const knex = require('knex')
const moment = require('moment')
const path = require('path')
const fs = require('fs')

const config = require('../config')

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL || config.dbURI,
    ssl: true,
  }
})

module.exports = {
	addPlayer: (req, res) => {
		const { playerID, venueID, firstName, lastName, birthday, email, mobile, address, suburb, state, postcode, mailOkay } = req.body.playerData

		
	}
}