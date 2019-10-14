// For JWT auth

module.exports = {
	verifyAdmin: (req, res, next) => {
		const { username, accessLevel } = req.body.staffData

		if (!username || accessLevel != 'Admin') {
			res.status(400).send('Invalid credentials. Must be signed is as Admin.')
		}

		next()
	}
}