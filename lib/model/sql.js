const axios = require('axios');
const createError = require('http-errors')
var app = require('../agile_conf').application
var conf_template = require('../agile_conf').sdk
var sql = require('../agile_conf').sql
var agile = require('agile-sdk')


/**
 * A module executing sql entries from a backend.
 * @module sql
 */

/**
 * This module instantiates the agile-sdk with the current session token (from the router).
 *
 */
var executeAction = function (token, method, args) {
	let conf = Object.assign({}, conf_template)
	conf.token = token
	let sdk = agile(conf)
	axios.defaults.headers.common['Authorization'] = 'bearer ' + conf.token;

	return new Promise((resolve, reject) => {
		let query = [
			{
				entityId: app.id,
				entityType: app.type,
				field: `actions.tables`,
				method: method
			},
			{
				entityId: app.id,
				entityType: app.type,
				field: `actions.tables.contacts`,
				method: method
			},
			{
				entityId: app.id,
				entityType: app.type,
				field: `actions.tables.secrets`,
				method: method
			}]
		let contacts = [];
		let result;
		sdk.policies.pdp.evaluate(query).then((res) => {
			result = res;
			prepareTables(result, resolve, reject).then(res => {
				console.log(`query for sql ${JSON.stringify(query)}`)
				console.log(`result from the PDP evaluation for sql ${JSON.stringify(result)}`)
				if (result[0]) {
					if (method.toUpperCase() === 'READ') {
						if (result[1]) {
							axios.post(sql, {
								query: 'SELECT * FROM contacts'
							}).then(response => {
								if (response.data.results) {
									contacts = response.data.results;
								}
								if (result[2]) {
									return axios.post(sql, {
										query: 'SELECT * FROM secrets'
									})
								} else {
									return response
								}
							}).then(response => {
								if (response.data.results) {
									contacts = contacts.map(contact => {
										let secret = response.data.results.find(sec => {
											return sec.ContactID === contact.ContactID;
										})
										if (secret) {
											contact.secret = secret.Secret
										}
										return contact
									})
								}
								resolve(contacts);
							}).catch(error => {
								reject(createError(500, error))
							});
						} else {
							return res
						}
					} else if (method.toUpperCase() === 'WRITE') {
						if (result[1]) {
							axios.post(sql, {
								query: "INSERT INTO contacts (Name, Number, Email) VALUES ('" + args.name + "', '" + args.number + "', '" + args.email + "')"
							}).then(res => {
								if (!res.data.error) {
									if (result[2]) {
										return axios.post(sql, {
											query: "INSERT INTO secrets (ContactID, Secret) VALUES (" + res.data.results.insertId + ", '" + args.secret + "')"
										})
									}
								} else {
									throw Error(res.data.error);
								}
							}).then(res => {
								if (!res.data.error) {
									resolve(contacts);
								} else {
									reject(createError(500, res.data.error))
								}
							}).catch(error => {
								reject(createError(500, error))
							});
						}
					}
				} else {
					reject(createError(401, 'Not authorized'))
				}
			}).catch((error) => {
				reject(createError(500, error))
			})
		})
	});
}

function prepareTables() {
	return axios.post(sql, {
		query: 'SELECT * FROM contacts;'
	}).then(res => {
		if (res.data.error) {
			return axios.post(sql, {
				query: 'CREATE TABLE contacts (' +
				'ContactID int AUTO_INCREMENT, ' +
				'Name VARCHAR(255), ' +
				'Number VARCHAR(255), ' +
				'Email VARCHAR(255), ' +
				'PRIMARY KEY(ContactID));'
			})
		}
		return res
	}).then(res => {
		if (!res.data.error) {
			return axios.post(sql, {
				query: 'SELECT * FROM secrets;'
			})
		}
		//TODO ADD ERROR HANDLING
	}).then(res => {
		if (res.data.error) {
			return axios.post(sql, {
				query: "CREATE TABLE secrets (" +
				"SecretID int AUTO_INCREMENT, " +
				"ContactID int, " +
				"Secret VARCHAR(255), " +
				"PRIMARY KEY(SecretID), " +
				"FOREIGN KEY(ContactID) REFERENCES contacts(ContactID));"
			})
		}
		return res;
	}).catch(err => {
		throw Error(err)
	})
}

module.exports = {
	executeAction
}
