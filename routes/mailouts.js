const controller = require('../controllers/mailout')
const utils = require('../utils')

module.exports = (router) => {
	router.route('/mailout/getMailTemplate')
		.post(utils.validateToken, controller.genericMailout)

	
}