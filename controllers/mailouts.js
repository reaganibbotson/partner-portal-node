// ---- MAILOUT SUBMISSIONS ----
// Create mailout templates
// Export mailout submissions
	// Need Word docs for each type, plus player data CSVs for Nexus venues
	// Generate Barcodes for Nexus Rising Sun Hotel (marked as TRUE for barcode column in venues table)
	// Download all files in a ZIP folder
// Venue submit mailouts

const knex = require('knex')
const moment = require('moment')

const config = require('../config')

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL || config.dbURI,
    ssl: true,
  }
})


const getFirstMonday = () => {
	let thingo = moment().add(1, 'months').date(1).day(1).format('YYYY-MM-DD')

	if (parseInt(moment(thingo).format('MM')) < parseInt(moment().add(1, 'months').format('MM'))) {
		thingo = moment().add(1, 'months').date(1).day(1).add(1, 'weeks').format('YYYY-MM-DD')
	}

	return parseInt(moment(thingo).format('DD'))
}

const getLastFriday = () => {
	let thingo = moment().add(1, 'months').date(31).day(5).format('YYYY-MM-DD')

	if (parseInt(moment(thingo).format('MM')) > parseInt(moment().add(1, 'months').format('MM'))) {
		thingo = moment().add(1, 'months').date(31).day(5).subtract(1, 'weeks').format('YYYY-MM-DD')
	}

	return thingo
}

module.exports = {
	genericMailout: (req, res) => {
		const firstMonday = getFirstMonday()

		const data = {
			templateMonth: moment().add(1, 'month').format('YYYY-MM'),
			startDate: moment().format('YYYY-MM-DD'),
			endDate: getLastFriday(),
			intoText: `
				You have the chance to win these weekly prizes in ${moment().add(1, 'month').format('MMMM')}:
				
				Week 1 & 3 prizes: <<PRIZE_1>> will be drawn at 11am on Monday ${firstMonday} and ${firstMonday + 14} ${moment().add(1,'m').format('MMMM YYYY')}.

				Week 2 & 4 prizes: <<PRIZE_2>> will be drawn at 11am on Monday ${firstMonday + 7} and ${firstMonday + 21} ${moment().add(1,'m').format('MMMM YYYY')}.

				Remember to bring in your four weekly entry coupons when visiting the venue to enter into each weekly prize draw for your chance to win.

				We look forward to seeing you soon.
			`,
			offer1: `
				Present this voucher to receive a complimentary drink (glass of house wine or glass of soft drink).

				Only valid at <<VENUE>> between 1 and ${firstMonday - 1} ${moment().add(1,'m').format('MMMM YYYY')}. Not valid with any other offer.
			`,
			offer2: `
				Present this voucher to receive a complimentary drink (glass of house wine or glass of soft drink).

				Only valid at <<VENUE>> between ${firstMonday} and ${firstMonday + 6} ${moment().add(1,'m').format('MMMM YYYY')}. Not valid with any other offer.
			`,
			offer3: `
				Present this voucher to receive a complimentary drink (glass of house wine or glass of soft drink).

				Only valid at <<VENUE>> between ${firstMonday + 7} and ${firstMonday + 13} ${moment().add(1,'m').format('MMMM YYYY')}. Not valid with any other offer.
			`,
			offer4:`
				Present this voucher to receive a complimentary drink (glass of house wine or glass of soft drink).

				Only valid at <<VENUE>> between ${firstMonday + 14} and ${firstMonday + 20} ${moment().add(1,'m').format('MMMM YYYY')}. Not valid with any other offer.
			`,
			venueMarketing: 'INSERT YOUR MARKETING PROMO MESSAGE HERE.'
		}

		res.status(200).send(data)
	},

	genericBday: (req, res) => {
		res.status(200).send({
			templateMonth: moment().add(1, 'month').format('YYYY-MM-DD'),
			startDate: moment().format('YYYY-MM-DD'),
			endDate: getLastFriday(),
			defaultText: `
				Wishing you a very Happy Birthday and a wonderful year ahead!

				To help celebrate your Birthday, please find attached two special offers for you to use throughout the month. 

				We look forward to seeing you soon!
			`,
			offer1: `
				Present this voucher to receive a complimentary drink (glass of house wine of glass of soft drink).

				Only valid at <<VENUE>> between 1 and 15 ${moment().add(1,'m').format('MMMM YYYY')}. Not valid with any other offer.
			`,
			offer2: `
				Present this voucher to receive a complimentary drink (glass of house wine of glass of soft drink).

				Only valid at <<VENUE>> between 16 and ${moment().add(1,'m').date(31).format('DD')} ${moment().add(1,'m').format('MMMM YYYY')}. Not valid with any other offer.
			`
		})
	},

	genericEmail: (req, res) => {
		res.status(200).send({
			templateMonth: moment().add(1, 'month').format('YYYY-MM-DD'),
			startDate: moment().format('YYYY-MM-DD'),
			endDate: getLastFriday()
		})
	},

	saveMailoutTemplate: (req, res) => {
		const { templateMonth, mailType,  intoText, offer1, offer2, offer3, offer4, venueMarketing, startDate, endDate } = req.body.mailout

		db.raw(`
			insert into mailout_templates (date, type, text1, text2, text3, text4, text5, text6, start_date, end_date)
			values (${templateMonth}, ${mailType}, ${intoText}, ${offer1}, ${offer2}, ${offer3}, ${offer4}, ${venueMarketing}, ${start_date}, ${end_date})
		`)
		.then(data => {
			res.status(200).send(data.rows[0])
		})
		.catch(err => {
			res.status(400).send(err)
		})
	},

	mailoutSubmission: (req, res) => {
		const { venueID, submissionDate, mailType, text1, text2, text3, text4, text5, text6, filters } = req.body.mailout

		
	},

	exportMailouts: (req, res) => {
		
	},

}