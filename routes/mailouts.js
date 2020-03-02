const controller = require('../controllers/mailouts')
const utils = require('../utils')

module.exports = (router) => {
	router.route('/mailout/getMailTemplate')
		.post(utils.validateToken, controller.genericMailout)

	
}