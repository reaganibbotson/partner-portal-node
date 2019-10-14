const knex = require('knex')
const bcrypt = require('bcrypt')
const config = require('../config')

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL || config.dbURI,
    ssl: true,
  }
});


module.exports = {
	addStaff:  (req, res)=>{
		const { username, password, name, accessLevel } = req.body

		const hash = bcrypt.hashSync(password, 10)
		db.raw(`
			insert into staff (username, password, name, access_level)
			values (${username}, ${hash}, ${name}, ${accessLevel})
			returning *
		`)
		.then(data => {
			console.log(data)
			res.status(200).send(data.rows)
		})
		.catch(err=>{
			res.status(400).send(err)
		})
	},


	loginStaff: (req, res)=>{
		const { username, password } = req.body

		if(!username || !password){
			res.status(400).json({'status': 'fail', 'data': 'Incorrect login credentials. Please try again.'})
		} else {
			db.raw(`
				select
					username,
					password
				from staff
				where username = ${username}
			`)
			.then(data=>{
				const validPassword = bcrypt.compareSync(password, data[0].password)
				if(validPassword){
					return db.raw(`
						select
							*
						from staff
						where username = ${username}
					`)
					.then(data=>{
						res.status(200).send(data.rows)
					})
					.catch(err=>{
						res.status(400).send(`Unable to find user data.`)
					})
				}
			})
			.catch(err=>{
				res.status(400).send(`Invalid credentials. Please try again.`)
			})
		}
	},

	listStaff: (req, res)=>{
		db.raw(`
			select
				staff_id,
				username,
				name,
				access_level
			from staff
			order by staff_id
		`)
		.then(data=>{
			res.status(200).send(data.rows)
		})
		.catch(err=>{
			res.status(400).send(err)
		})
	},


}