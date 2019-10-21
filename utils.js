// For JWT auth
const config = require('./config')

const jwt = require('jsonwebtoken')
const knex = require('knex')({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL || config.dbURI,
    ssl: true,
	}
})


module.exports = {
	verifyAdmin: (req, res, next) => {
		const { username, accessLevel } = req.body.staffData

		console.log(req.decoded)

		if (req.decoded.payload.accessLevel === 'Admin') {
			console.log('Validated on token. Maybe get rid of the rest?')
		}

		const credentialCheck = (username, accessLevel) => {
			return knex.raw(`
				select
					*
				from staff
				where username = ${username}
			`)
			.then(data => {
				if (data.rows[0].access_level === accessLevel){
					return true
				}
			})
			.catch(err => {
				console.log('Credentials couldn\'t be validated: ', err)
				return false
			})
		}

		if (!credentialCheck) {
			res.status(401).send('Invalid credentials. Must be signed is as Admin.')
		}

		next()
	},

	validateToken: (req, res, next) => {
		const authHeader = req.headers.authorization || req.body.authorization || req.query.authorization
		if (authHeader) {
			const token = req.headers.authorization.split(' ')[1]
			const secret = process.env.JWT_SECRET || config.JWT_SECRET
			const options = {
				expiresIn: '30m'
			}
			try {
				result = jwt.verify(token, secret, options)
				req.decoded = result
				next()
			} catch (err) {
				console.log(err)
				res.status(500).send('Unable to authenticate token. Access DENIED.')
			}
		} else {
			res.status(401).send('Authentication error. Token required for this route.')
		}
	},

	
}