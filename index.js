const express = require('express')
const body-parser = require('body-parser')
const cors = require('cors')

const knex = require('knex')
const moment = require('moment')
const bcrypt = require('bcrypt')

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  }
});

const app = express()

app.use(cors())
app.use(body-parser.json())

app.post('/add-staff', (req, res)=>{
	const { username, password, name, accessLevel } = req.body
	if(!username || !password || !name || accessLevel){
		res.status(400).json('Incorrect form data. Please try agian.')
	} else {
		const hash = bcrypt.hashSync(password, 10)
		db.raw(`
			insert into staff (username, password, name, access_level)
			values (${username}, ${hash}, ${name}, ${accessLevel})
			returning *
		`)
		.then(data => {
			console.log(data)
			res.status(200).json({status: 'success', data: data})
		})
		.catch(err=>{
			res.status(400).{status: 'fail', data: err})
		})
	}
})

app.post('/login-staff', (req, res)=>{
	const { username, password } = req.body
	if(!username || !password){
		res.status(400).json('Incorrect login credentials. Please try again.')
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
					res.status(200).json(data)
				})
				.catch(err=>{
					res.status(400).json(`Unable to find user data.`)
				})
			}
		})
		.catch(err=>{
			res.status(400).json(`Invalid credentials. Please try again.`)
		})
	}
})

app.put('/add-venue', (req, res)=>{
	// Receive login
})

app.listen(process.env.PORT || 3001, ()=> {
	console.log(`Listening on port ${process.env.PORT || 3000}`)
})