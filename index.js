const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const knex = require('knex')
const moment = require('moment')
const bcrypt = require('bcrypt')

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL || config.dbURL,
    ssl: true,
  }
});

const app = express()
const router = express.Router()

const routes = require('./routes/index')

// Middleware
app.use(cors())
app.use(bodyParser.json())


// Routes
app.get('/', (req, res)=>{
	console.log('Hello there')
	res.status(200).send('Connected babyyyy')
})

app.post('/add-staff', (req, res)=>{
	const { username, password, name, accessLevel } = req.body

	if(!username || !password || !name || !accessLevel){
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
			res.status(400).json({status: 'fail', data: err})
		})
	}
})

app.post('/login-staff', (req, res)=>{
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
					res.status(200).json({status: 'success', data:data})
				})
				.catch(err=>{
					res.status(400).json({status: 'fail', data: `Unable to find user data.`})
				})
			}
		})
		.catch(err=>{
			res.status(400).json({status: 'fail', data: `Invalid credentials. Please try again.`})
		})
	}
})


app.get('/staff-list', (req, res)=>{
	const { username, accessLevel } = req.body

	if(!username || accessLevel != 'Admin'){
		res.status(400).json({status: 'fail', data: 'Invalid Admin credentials.'})
	} else {
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
			res.status(200).json({status: 'success', data: data})
		})
		.catch(err=>{
			res.status(400).json({status: 'fail', data: err})
		})
	}
})

app.post('/add-venue', (req, res)=>{
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
			res.status(200).json({status: 'success', data: data})
		})
		.catch(err=>{
			res.status(400).json({status: 'fail', data: err})
		})
	}
})


app.listen(process.env.PORT || 3001, ()=> {
	console.log(`Listening on port ${process.env.PORT || 3001}`)
})