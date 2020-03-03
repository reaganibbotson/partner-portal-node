const axios = require('axios')

const currentTest = async () => {
	const connected = await axios.get('http://localhost:3001/api/v1/')
	console.log(connected.data)

	// const addStaff = await axios({
	// 	method:'post',
	// 	url:'http://localhost:3001/api/v1/staff/add',
	// 	data: {
	// 		staffData: {
	// 			username: 'Testy',
	// 			password: 'password',
	// 			name: 'Tester',
	// 			accessLevel: 'Admin'
	// 		}
	// 	}
	// })
	// console.log(addStaff)

	const loginStaff = await axios({
		method: 'post',
		url:'http://localhost:3001/api/v1/staff/login',
		data: {
			username: 'Testy',
			password: 'password'
		}
	})

	let listStaff
	try {
		listStaff = await axios({
			method:'get',
			url:'http://localhost:3001/api/v1/staff/list',
			data: {
				authorization: {
					token: loginStaff.data.token
				},
				staffData: {
					username: loginStaff.data.result[0].username,
					accessLevel: loginStaff.data.result[0].access_level,
				}
			}
		})
	} catch (err) {
		console.log(err)
	}

	const getStaffMember = await axios({
		method: 'get',
		url:`http://localhost:3001/api/v1/staff/member/${loginStaff.data.result[0].staff_id}`,
		data: {
			authorization: {
				token: loginStaff.data.token
			},
			staffData: {
				username: loginStaff.data.result[0].username,
				accessLevel: loginStaff.data.result[0].access_level,
			}
		}
	})
	
	console.log(getStaffMember.data)
}

currentTest()