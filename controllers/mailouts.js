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
const { Document, Packer, Paragraph, TextRun, UnderlineType, HeadingLevel, AlignmentType, TabStopPosition } = require("docx")
const path = require('path')
const fs = require('fs')
const glob = require('glob')

const config = require('../config')

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL || config.dbURI,
    ssl: true,
  }
})

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
				Wishing you a very Happy Birthday and a wonderful year ahead! To help celebrate your Birthday, please find attached two special offers for you to use throughout the month. We look forward to seeing you soon!
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
			values (${templateMonth}::date, ${mailType}, ${intoText}, ${offer1}, ${offer2}, ${offer3}, ${offer4}, ${venueMarketing}, ${start_date}, ${end_date})
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
			values (${venueID}, ${submissionDate}::date, ${mailType}, ${text1}, ${text2}, ${text3}, ${text4}, ${text5}, ${text6}, ${filters})
		`)
		.then(data => {
			res.status(200).send(data.rows[0])
		})
		.catch(err => {
			res.status(400).send(err)
		})
	},

	exportMailouts: async (req = {body: {submission: {subMonth: 10, subYear: 2019}}}, res = {}) => {
		const { subMonth, subYear } = req.body.submission

		// Validate dates, check there are subs
		if (typeof subMonth !== 'number' || typeof subYear !== 'number') {
			res.status(400).send('Year & month are invalid. Check ya self boi.')
		}

		const submissions = await db.raw(`
			select
				v.venue_name,
				vs.*
			from venue_subs vs
			left join venues v
				on vs.venue_id = v.venue_id
			where 
				extract('month' from sub_date) = ${subMonth}
				and extract('year' from sub_date) = ${subYear}
		`)
		.then(data => {
			return data.rows
		})
		.catch(err => {
			return ['Error', err]
		})

		if (!submissions[0]) {
			console.log('No subs found')
			// res.status(500).send('No submissions found.')
		} else if (submissions[0] === 'Error') {
			console.log('Error retrieving data.')
			res.status(500).send('Error retrieving data.')
		}

		// If there is an existing zip, clear the file (glob it?)
		await glob(path.join(__dirname, '../temp/', '*.zip'),(err, files)=>{
			if (err) {
				console.log(err)
				res.status(500).send('Unable to clear temp folder. Glob call failed.')
			}
			files.forEach((file)=>{
				fs.unlink(file, (err)=>{
					if(err){
						console.log(err)
					}
				})
			})
		})

		// Create new zip object
		const zip = new JSZip()
		let writeData
		// For each submission
		for (let submission of submissions) {
			// Generate doc
			if (submission.type === 'mailout') {
				writeData = await docxMakeMailout(submission)
			} else if (submission.type === 'bday') {
				writeData = await docxMakeBday(submission)
			} else {
				writeData = await docxMakeEmail(submission)
			}

			// Add file to zip
			zip.file(`${submission.type}/${submission.venue_name} ${submission.type} - ${moment(submission.sub_date).format('YYYY-MM')}.docx`, writeData)
		}
		
		await zip.generateAsync({type: 'nodebuffer'}).then((content) => {
			fs.writeFileSync(path.join(__dirname, '../temp/', `${subYear}-${subMonth}.zip`), content)
			console.log('File written')
		})
		
		res.status(200).sendFile(path.join(__dirname, '../temp/',`${subYear}-${subMonth}.zip`))
	},

	exportDataFiles: async () => {
		const { subMonth, subYear } = req.body.submission

		// Check which venues need data exported
		const submissions = await knex.raw(`
			select 
				* 
			from venue_subs
			where 
				filters ->> 'filters' != '[]'
				and extract('year' from sub_date) = '${subYear}'
				and extract('month' from sub_date) = '${subMonth}'
		`).then(data => {
			return data.rows
		}).catch(err => {
			return {status: 'failed', data: err}
		})

		if (data.status) {
			res.status(500).send({message:'Error getting the submissions.', error: submissions.data})
		} else if (data.rows.length < 1) {
			res.status(500).send('No submissions found.')
		}

		

		// Check if barcodes are necessary 
			// Generate barcodes for each player if necessary
	},

}

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

const myDocxStyles = {
	paragraphStyles: [
		{
			id: "Heading1",
			name: "Heading 1",
			basedOn: "Normal",
			next: "Normal",
			quickFormat: true,
			run: {
				font: "Calibri",
				size: 26,
				bold: true,
				color: "000000",
				underline: {
					type: UnderlineType.SINGLE,
					color: "000000",
				},
			},
			paragraph: {
				alignment: AlignmentType.LEFT,
				spacing: {
					line: 340
				},
			},
		},
		{
			id: "normalPara",
			name: "Normal Para",
			basedOn: "Normal",
			next: "Normal",
			quickFormat: true,
			run: {
				font: "Calibri",
				size: 22,
				bold: false,
			},
			paragraph: {
				spacing: {
					line: 276, 
					before: 20 * 72 * 0.1, 
					after: 20 * 72 * 0.05
				},
				rightTabStop: TabStopPosition.MAX,
				leftTabStop: 453.543307087,
			},
		},
		{
			id: "wellSpaced",
			name: "Well Spaced",
			basedOn: "Normal",
			run: {
				font: "Calibri",
				size: 22,
				bold: false,
			},
			paragraph: {
				spacing: {
					line: 240,
					before: 20 * 72 * 0.1,
					after: 20 * 72 * 0.1
				},
			},
		},
		{
			id: "wellSpacedAfter",
			name: "Well Spaced After",
			basedOn: "Normal",
			run: {
				font: "Calibri",
				size: 22,
				bold: false,
			},
			paragraph: {
				spacing: {
					line: 240,
					after: 20 * 72 * 0.1
				},
			},
		},
		{
			id: "wellSpacedBefore",
			name: "Well Spaced Before",
			basedOn: "Normal",
			run: {
				font: "Calibri",
				size: 22,
				bold: false,
			},
			paragraph: {
				spacing: {
					line: 240,
					before: 20 * 72 * 0.1
				},
			},
		},
		{
			id: "noSpaced",
			name: "No Spaced",
			basedOn: "Normal",
			run: {
				font: "Calibri",
				size: 22,
				bold: false,
			},
			paragraph: {
				spacing: {
					line: 240
				},
			},
		},
	],
}

const docxMakeMailout = async (data) => {
	const { venue_id, sub_date, type, text1, text2, text3, text4, text5, text6, filters } = data
	const venueSignoff = await db.raw(`
			select
				boss,
				boss_role,
				venue_name
			from venues
			where venue_id = ${venue_id}
		`)
		.then(data => {
			return [data.rows[0].boss, data.rows[0].boss_role, data.rows[0].venue_name]
		})
		.catch(err => {
			console.log('Error getting venue signoff.', err)
			return err
		})

	const doc = new Document({
		styles: myDocxStyles
	})
	
	doc.addSection({
		properties: {},
		children: [
			new Paragraph({
				text: text1,
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: 'Kind regards,',
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: venueSignoff[0],
				style: 'wellSpacedBefore'
			}),
			new Paragraph({
				text: venueSignoff[1],
				style: 'noSpaced'
			}),
			new Paragraph({
				text: venueSignoff[2],
				style: 'wellSpacedAfter'
			}),
			new Paragraph({
				text: 'Offer 1',
				style: 'Heading1'
			}),
			new Paragraph({
				text: text2,
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: 'Offer 2',
				style: 'Heading1'
			}),
			new Paragraph({
				text: text3,
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: 'Offer 3',
				style: 'Heading1'
			}),
			new Paragraph({
				text: text4,
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: 'Offer 4',
				style: 'Heading1'
			}),
			new Paragraph({
				text: text5,
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: 'Venue Designated Page',
				style: 'Heading1'
			}),
			new Paragraph({
				text: text6,
				style: 'wellSpaced'
			})
		]
	})

	return await Packer.toBuffer(doc)
}

const docxMakeBday = async (data) => {
	const { venue_id, sub_date, type, text1, text2, text3, text4, text5, text6, filters } = data
	const venueSignoff = await db.raw(`
			select
				boss,
				boss_role,
				venue_name
			from venues
			where venue_id = ${venue_id}
		`)
		.then(data => {
			return [data.rows[0].boss, data.rows[0].boss_role, data.rows[0].venue_name]
		})
		.catch(err => {
			console.log('Error getting venue signoff.', err)
			return err
		})

	const doc = new Document({
		styles: myDocxStyles
	})
	
	doc.addSection({
		properties: {},
		children: [
			new Paragraph({
				text: text1,
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: 'Kind regards,',
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: venueSignoff[0],
				style: 'wellSpacedBefore'
			}),
			new Paragraph({
				text: venueSignoff[1],
				style: 'noSpaced'
			}),
			new Paragraph({
				text: venueSignoff[2],
				style: 'wellSpacedAfter'
			}),
			new Paragraph({
				text: 'Offer 1',
				style: 'Heading1'
			}),
			new Paragraph({
				text: text2,
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: 'Offer 2',
				style: 'Heading1'
			}),
			new Paragraph({
				text: text3,
				style: 'wellSpaced'
			})
		]
	})


	return await Packer.toBuffer(doc)
}


const docxMakeEmail = async (data) => {
	const { venue_id, sub_date, type, text1, text2, text3, text4, text5, text6, filters } = data
	const venueSignoff = await db.raw(`
			select
				boss,
				boss_role,
				venue_name
			from venues
			where venue_id = ${venue_id}
		`)
		.then(data => {
			return [data.rows[0].boss, data.rows[0].boss_role, data.rows[0].venue_name]
		})
		.catch(err => {
			console.log('Error getting venue signoff.', err)
			return err
		})

	const doc = new Document({
		styles: myDocxStyles
	})
	
	doc.addSection({
		properties: {},
		children: [
			new Paragraph({
				text: text1,
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: 'Kind regards,',
				style: 'wellSpaced'
			}),
			new Paragraph({
				text: venueSignoff[0],
				style: 'wellSpacedBefore'
			}),
			new Paragraph({
				text: venueSignoff[1],
				style: 'noSpaced'
			}),
			new Paragraph({
				text: venueSignoff[2],
				style: 'wellSpacedAfter'
			})
		]
	})

	return await Packer.toBuffer(doc)
}