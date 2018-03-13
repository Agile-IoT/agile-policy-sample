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
				field: `actions.sql`,
				method: method
			},
			{
				entityId: app.id,
				entityType: app.type,
				field: `actions.sql.contacts`,
				method: method
			},
			{
				entityId: app.id,
				entityType: app.type,
				field: `actions.sql.secrets`,
				method: method
			}]
		let contacts;
		sdk.policies.pdp.evaluate(query).then((result) => {
			console.log(`result from the PDP evaluation ${JSON.stringify(result)}`)
			if (method.toUpperCase() === 'READ') {
				prepareTables().then(res => {
					if (!res.data.error) {
						return axios.post(sql, {
							query: 'SELECT * FROM contacts'
						})
					} else {
						throw Error(res.data.error);
					}
				}).then(response => {
					contacts = response.data.results;
					return axios.post(sql, {
						query: 'SELECT * FROM secrets'
					})
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
			} else if (method.toUpperCase() === 'WRITE') {
				prepareTables().then(res => {
					if (!res.data.error) {
						return axios.post(sql, {
							query: "INSERT INTO contacts (Name, Number, Email) VALUES ('" + args.name + "', '" + args.number + "', '" + args.email + "')"
						})
					} else {
						throw Error(res.data.error);
					}
				}).then(res => {
					if (!res.data.error) {
						return axios.post(sql, {
							query: "INSERT INTO secrets (ContactID, Secret) VALUES (" + res.data.results.insertId + ", '" + args.secret + "')"
						})
					} else {
						throw Error(res.data.error);
					}
				}).then(res =>{
					if(!res.data.error) {
						resolve(contacts);
					} else {
						reject(createError(500, res.data.error))
					}
				}).catch(error => {
					reject(createError(500, error))
				});
			}
		}).catch((error) => {
			reject(createError(500, error))
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
		throw Error(res.data.error);
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
	})
}

module.exports = {
	executeAction
}
