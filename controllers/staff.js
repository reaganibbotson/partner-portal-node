// ---- STAFF MANAGEMENT ----
// Add staff (protected, admins only)
// Login staff
// Get list of staff (protected, admins only)
// Get individual staff data (protected, admins only) --> staff details page
// Change staff password (protected, admins only)
// Delete staff (protected, admins only)
// Update own details (protected, same user only)


const knex = require('knex')
const bcrypt = require('bcrypt')
const config = require('../config')
const jwt = require('jsonwebtoken')

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL || config.dbURI,
    ssl: true,
  }
})


module.exports = {
	addStaff:  (req, res) => {
		const { username, password, name, accessLevel } = req.body.staffData

		const hash = bcrypt.hashSync(password, 10)
		db.raw(`
			insert into staff (username, password, name, access_level)
			values ('${username}', '${hash}', '${name}', '${accessLevel}')
		`)
		.then(data => {
			res.status(200).send(data.rows)
		})
		.catch(err=>{
			res.status(400).send(err)
		})
	},

	loginStaff: (req, res) => {
		const { username, password } = req.body

		if (!username || !password) {
			res.status(400).send({'status': 'fail', 'data': 'Missing login credentials. Please try again.'})
		} else {
			db.raw(`
				select
					username,
					password,
					access_level
				from staff
				where username = '${username}'
			`)
			.then(data => {
				const validPassword = bcrypt.compareSync(password, data.rows[0].password)
				if (validPassword) {
					
					const payload = {
						user: data.rows[0].username,
						accessLevel: data.rows[0].access_level
					}
					const secret = process.env.JWT_SECRET || config.JWT_SECRET
					const options = {
						expiresIn: '30m'
					}
					const token = jwt.sign(payload , secret, options)

					
					return db.raw(`
						select
							*
						from staff
						where username = '${username}'
					`)
					.then(data => {
						res.status(200).send({token: token, result: data.rows})
					})
					.catch(err => {
						res.status(400).send(`Unable to find user data.`)
					})
				}
			})
			.catch(err => {
				console.log(err)
				res.status(401).send(`Invalid credentials. Please try again.`)
			})
		}
	},

	listStaff: (req, res) => {
		db.raw(`
			select
				staff_id,
				username,
				name,
				access_level
			from staff
			order by staff_id
		`)
		.then(data => {
			res.status(200).send(data.rows)
		})
		.catch(err => {
			res.status(400).send(err)
		})
	},

	getStaffMemberData: (req, res) => {
		const staffID = req.params.id
		
		if (!staffID) {
			res.status(400).send(`No staff ID found in request.`)
		}

		db.raw(`
			select
				staff_id,
				username,
				name,
				access_level
			from staff
			where staff_id = ${staffID}
		`)
		.then(data => {
			res.status(200).send(data.rows[0])
		})
		.catch(err => {
			res.status(400).send(`Couldn't retrieve staff data for ${staffID}.`)
		})
	},

	deleteStaff: (req, res) => {
		const staffID = req.body.staffID

		if (!staffID) {
			res.status(400).send(`No staff ID found in request.`)
		}

		db.raw(`
			delete from staff where staff_id = ${staffID}
		`)
		.then(data => {
			res.status(200).send({message: 'Successfully deleted staff member', result: data.rows[0]})
		})
		.catch(err => {
			res.status(404).send({message: 'Couldn\'t delete staff member', error: err})
		})
	},

	updateSelf: (req, res) => {
		const {
			staffID,
			username,
			password,
			name,
			accessLevel
		} = req.body.staffData
		
		let hash = ''
		if (password) {
			hash = bcrypt.hashSync(password, 10)
		} else {
			hash = db.raw(`
				select password from staff where username = '${username}'
			`).then(data => {
				return data.rows[0]
			}).catch(err => {
				console.log(err)
				res.status(500).send('Couldn\'t retrieve current password in DB. Try again.')
			})
		}

		db.raw(`
			update staff
			set username = '${username}', password = '${hash}', name = '${name}', access_level = '${accessLevel}'
			where staff_id = ${staffID}
		`)
		.then(data => {
			res.status(200).send(data.rows)
		})
		.catch(err => {
			res.status(400).send('Update failed. Check data sent and try again if ya feel loike it.')
		})
	},

	changePassword: (req, res) => {
		const {
			username,
			password
		} = req.body.staffData

		const hash = bcrypt.hashSync(password, 10)
		db.raw(`
			update staff
			set password = '${hash}'
			where username = '${username}'
		`)
		.then(data => {
			res.status(200).send(data.rows)
		})
		.catch(err => {
			res.status(500).send('Couldn\'t update password, sorry mate.')
		})
	},

	createUser: (req, res) => {
		const {
			venue_id,
			name,
			email,
			mobile,
			username,
			password,
			status,
			shop
		} = req.body.userData

		const hash = bcrypt.hashSync(password, 10)
		db.raw(`
			insert into users (venue_id, name, email, mobile, username, password, status, shop)
			values ( '${venue_id}', '${name}', '${email}', '${mobile}', '${username}', '${password}', '${status}', '${shop}')
		`).then(data => {
			res.status(200).send(data)
		}).catch(err => {
			res.status(400).send(err)
		})
	},

	
}