const express = require('express')
const cors = require('cors')

const app = express()
const router = express.Router()

const routes = require('./routes/index')

// Middleware
app.use(cors())
app.use(express.json())

app.use('/api/v1', routes(router))

app.listen(process.env.PORT || 3001, ()=> {
	console.log(`Listening on port ${process.env.PORT || 3001}`)
})

module.exports = app