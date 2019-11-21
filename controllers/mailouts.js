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
const officegen = require('officegen')
const { Document, Packer, Paragraph, TextRun, ...docx } = require("docx")

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
		// Create the document object
		let docx = officegen('docx')

		docx.on('finalize', (written) => {
			console.log('File created for: ', venue_id, type)
		})

		docx.on('error', (err) => {
			console.log(err)
		})
		// Begin adding paragraphs and content to document object
		let pObj = docx.createP()
		pObj.addText(text1)

		pObj = docx.createP()
		pObj.addText('Kind regards,')

		pObj = docx.createP()
		venueSignoff.forEach(line=>{
			pObj.addText(line)
			pObj.addLineBreak()
		})
		// Loop 4 times to create weekly offers
		for (x = 1; x <= 4; x++) {
			pObj = docx.createP()
			pObj.addText(`Offer ${x}`,{bold: true, font_size: 16})

			pObj = docx.createP()
			switch (x){
				case 1:
					pObj.addText(text2)
					break
				case 2:
					pObj.addText(text3)
					break
				case 3:
					pObj.addText(text4)
					break
				default:
					pObj.addText(text5) 
			}
		}

		pObj = docx.createP()
		pObj.addText('Venue Designated Text Page', {bold: true, font_size: 16})

		pObj = docx.createP()
		pObj.addText(text6)

	return docx
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

	const zip = new JSZip()

	const mailoutStuff = await makeMailoutDoc(data)
	let out = fs.createWriteStream(path.join(__dirname, 'example-mailout.docx'))
	out.on('error', (err) => {
		console.log(err)
	})
	await mailoutStuff.generate(out)

	zip.file('example-mailout.docx')

	const bDayStuff = await makeBdayDoc(bdayData)
	let bdayOut = fs.createWriteStream(path.join(__dirname, 'example-bday-mailout.docx'))
	bdayOut.on('error', (err) => {
		console.log(err)
	})
	await bDayStuff.generate(bdayOut)

	zip.file('example-bday-mailout.docx')

	zip.generateAsync({type: 'nodebuffer'})
		.then((content) => {
			fs.writeFileSync(path.join(__dirname, 'testzip.zip'), content)
		})


	return
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

	const doc = new Document()
	
	const myStyles = new docx.Styles()

	myStyles.createParagraphStyle('myParaStyle','thingo')
		.basedOn('Normal')
		.next('Normal')
		.spacing({line: 276})
		.font('Arial')
		.size(11)
		.spacing({before: 100, after: 100})

	doc.addSection({
		properties: {},
		children: [
			new Paragraph({
				text: text1
			}),
			new Paragraph({
				text: 'Kind regards,'
			}),
			new Paragraph({
				children: [
					new TextRun(venueSignoff[0])
				]
			}),
			new Paragraph({
				children: [
					new TextRun(venueSignoff[1])
				]
			}).style('myParaStyle'),
			new Paragraph({
				children: [
					new TextRun(venueSignoff[2])
				]
			}).style('myParaStyle'),
		]
	})


	return await Packer.toBuffer(doc)//.then(buffer=>{return buffer})

}

const docxMakeBday = async () => {
	
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

	fs.writeFileSync(path.join(__dirname,'examplemailoutdoco.docx'), testMailoutData)
	
	process.exit()
	return
}

test2()