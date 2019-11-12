// ---- MAILOUT SUBMISSIONS ----
// Create mailout templates
// Export mailout submissions
	// Need Word docs for each type, plus player data CSVs for Nexus venues
	// Generate Barcodes for Nexus Rising Sun Hotel (marked as TRUE for barcode column in venues table)
	// Download all files in a ZIP folder
// Venue submit mailouts

const knex = require('knex')
const moment = require('moment')
const JSZip = require('jszip')


const config = require('../config')

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL || config.dbURI,
    ssl: true,
  }
})

const path = require('path')
const fs = require('fs')

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

const makeMailoutDoc = async (data) => {
	const { venue_id, sub_date, type, text1, text2, text3, text4, text5, text6, filters } = data
	const venueSignoff = await db.raw(`
			select
				signoff
			from venues
			where venue_id = ${venue_id}
		`)
		.then(data => {
			return data.rows[0].signoff
		})
		.catch(err => {
			console.log('Error getting venue signoff.', err)
			return err
		})


	
	
	return
}

module.exports = {
	genericMailout: (req, res) => {
		const firstMonday = getFirstMonday()

		const data = {
			templateMonth: moment().add(1, 'month').format('YYYY-MM'),
			startDate: moment().format('YYYY-MM-DD'),
			endDate: getLastFriday(),
			introText: `
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

		db.raw(`
			insert into venue_subs (venue_id, sub_date, type, text1, text2, text3, text4, text5, text6, filters) 
			values (${venueID}, ${submissionDate}, ${mailType}, ${text1}, ${text2}, ${text3}, ${text4}, ${text5}, ${text6}, ${filters})
		`)
		.then(data => {
			res.status(200).send(data.rows[0])
		})
		.catch(err => {
			res.status(400).send(err)
		})
	},

	exportMailouts: (req, res) => {
		const { subMonth, subYear } = req.body.submission
		
		db.raw(`
			select
				*
			from venue_subs
			where 
				extract('month' from sub_date) = ${subMonth}
				and extract('year' from sub_date) = ${subYear}
		`)
		.then(data => {
			res.status(200).send(data)
		})
		.catch(err => {
			res.status(400).send(err)
		})
	},

	
}




const test = async () => {
	const data = {
		id: 123456789,
		venue_id: 7322,
		sub_date: '2019-12-01',
		type: 'mailout', 
		text1: 'You have the chance to win these weekly prizes in December: Week 1 & 3 prizes: A $250 Christmas Hamper will be drawn at 11am on Monday 9 and 23 December 2019. Week 2 & 4 prizes: A $200 Bunnings Gift Card will be drawn at 11am on Monday 16 and 30 December 2019. Remember to bring in your four weekly entry coupons when visiting the venue to enter into each weekly prize draw for your chance to win. We look forward to seeing you soon. ', 
		text2: 'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 1 to 8 December 2019. Not valid with any other offer.',
		text3: 'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 9 to 15 December 2019. Not valid with any other offer.',
		text4: 'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 16 to 22 December 2019. Not valid with any other offer.',
		text5: 'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 23 to 29 December 2019. Not valid with any other offer.',
		text6: 'hey',
		filters: 'The Festive Season is here, and we are giving all our Loyalty Members a chance to win some great prizes. As 2019 draws to an end, we sincerely thank all our members for their patronage. On behalf of ALL Management and Staff at the Abruzzo Club, we wish you all a very Merry Christmas and Happy & Safe 2020. We look forward to an exciting 2020.'
	}
	
	console.log('Making mailout doc')
	const mailoutStuff = await makeMailoutDoc(data)

	return
}

test()