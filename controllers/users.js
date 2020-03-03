// Log in
// Change own password
// Submit mailouts
// Edit mailout submissions


module.exports = (router) => {
	mailoutSubmission: (req, res) => {
		const { venueID, submissionDate, mailType, text1, text2, text3, text4, text5, text6, filters } = req.body.mailout

		db.raw(`
			insert into venue_subs (venue_id, sub_date, type, text1, text2, text3, text4, text5, text6, filters) 
			values (${venueID}, ${submissionDate}::date, ${mailType}, ${text1}, ${text2}, ${text3}, ${text4}, ${text5}, ${text6}, ${filters})
		`)
		.then(data => {
			res.status(200).send(data.rows[0])
		})
		.catch(err => {
			res.status(400).send(err)
		})
	},

	getCurrentMailouts: (req, res) => {
		db.raw(`
			select * from mailout_templates where now()::date between start_date and end_date
		`).then(data => {
			res.status(200).send(data)
		}).catch(err => {
			res.status(400).send(err)
		})
	},

	
}