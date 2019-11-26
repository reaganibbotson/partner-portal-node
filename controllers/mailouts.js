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

const makeBdayDoc = async (data) => {
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
		// Initialize b'day document object
		let docx = officegen('docx')

		docx.on('finalize', (written) => {
			console.log('File created for: ', venue_id, type)
		})

		docx.on('error', (err) => {
			console.log(err)
		})
		// Add content to b'day document
		let pObj = docx.createP()
		pObj.addText(text1)

		pObj = docx.createP()
		pObj.addText('Kind regards,')

		pObj = docx.createP()
		venueSignoff.forEach(line=>{
			pObj.addText(line)
			pObj.addLineBreak()
		})
		// Add 2 b'day offers to document object
		for (x = 1; x <= 2; x++) {
			pObj = docx.createP()
			pObj.addText(`Offer ${x}`,{bold: true, font_size: 16})

			pObj = docx.createP()
			if (x === 1) {
				pObj.addText(text2)
			} else {
				pObj.addText(text3)
			}
		}

	return docx
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
		styles: {
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
		},
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
		styles: {
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
		},
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


const test2 = async () => {

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
		text6: 'heasefay',
		filters: []
	}

	const bdayData = {
		id: 123456790,
		venue_id: 7322,
		sub_date: '2019-12-01',
		type: 'bday',
		text1: 'Wishing you a very Happy Birthday and a wonderful year ahead. To help celebrate your Birthday, please find attached two special offers for you to use throughout the month. We look forward to seeing you soon.', 
		text2: 'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Abruzzo Club between 1 to 15 December 2019. Not valid with any other offer.',
		text3: 'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Abruzzo Club between 16 to 31 December 2019. Not valid with any other offer.',
		text4: 'text 4',
		text5: 'text 5',
		text6: 'text 6',
		filters: []
	}

	const testMailoutData = await docxMakeMailout(data)
	const testBdayData = await docxMakeBday(bdayData)

	fs.writeFileSync(path.join(__dirname,'examplemailoutdoco.docx'), testMailoutData)

	const zip = new JSZip()

	zip.file('mailouts/testzipfile1.docx', testMailoutData)
	zip.file('mailouts/testzipfile2.txt', 'Hello hello')
	zip.file('mailouts/testzipfile3.docx', testMailoutData)
	zip.file('bdays/testbdayzipfile1.docx', testBdayData)

	await zip.generateAsync({type: 'nodebuffer'})
		.then((content) => {
			fs.writeFileSync(path.join(__dirname, 'test2zip.zip'), content)
		})
	
	process.exit()
	return
}

test2()