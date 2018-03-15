const axios = require('axios');
const createError = require('http-errors')
var app = require('../agile_conf').application
var conf_template = require('../agile_conf').sdk
var sql = require('../agile_conf').sql
var agile = require('agile-sdk')

var id = sql.entityId
var type = '/database'
var tables = 'actions.tables'
var tablesSecrets = 'actions.tables.secrets'
var tablesContacts = 'actions.tables.contacts'

/**
 * A module executing sql queries to a sql backend.
 * @module sql
 */

/**
 * This module instantiates the agile-sdk with the current session token (from the router).
 * Then it evaluates whether the user logged in can execute certain actions on the SQl-databases (actions.tables.contacts and actions.tables.secrets).
 * Also, depending on whether the query contains a read or a write action, the proper arguments are passed to the agile pdp.
 * If the policy allows it, the module executes the call
 */
var executeAction = function (token, method, args) {
  let conf = Object.assign({}, conf_template)
  conf.token = token
  let sdk = agile(conf)
  axios.defaults.headers.common['Authorization'] = 'bearer ' + conf.token;

  return new Promise((resolve, reject) => {
    let query = [
      {
        entityId: id,
        entityType: type,
        field: tables,
        method: method
      },
      {
        entityId: id,
        entityType: type,
        field: tablesContacts,
        method: method
      },
      {
        entityId: id,
        entityType: type,
        field: tablesSecrets,
        method: method
      }]
    let contacts = [];
    prepareTables(sdk).then(res => {
      sdk.policies.pdp.evaluate(query).then(result => {
        console.log(`result from the PDP evaluation for sql ${JSON.stringify(result)}`)
        if (method.toUpperCase() === 'READ') {
          if (result[1]) {
            axios.post(sql.host, {
              query: 'SELECT * FROM contacts'
            }).then(response => {
              if (response.data.results) {
                contacts = response.data.results;
              }
              if (result[2]) {
                return axios.post(sql.host, {
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
            reject(createError(401, 'Not authorized'))
          }
        } else if (method.toUpperCase() === 'WRITE') {
          if (result[1]) {
            axios.post(sql.host, {
              query: "INSERT INTO contacts (Name, Number, Email) VALUES ('" + args.name + "', '" + args.number + "', '" + args.email + "')"
            }).then(res => {
              if (!res.data.error && result[2]) {
                return axios.post(sql.host, {
                  query: "INSERT INTO secrets (ContactID, Secret) VALUES (" + res.data.results.insertId + ", '" + args.secret + "')"
                })
              }
              return res
            }).then(res => {
              if (!res.data.error) {
                resolve(contacts);
              } else {
                reject(createError(500, res.data.error))
              }
            }).catch(error => {
              reject(createError(500, error))
            });
          } else {
            reject(createError(401, 'Not authorized'))
          }
        }
      }).catch((error) => {
        reject(createError(500, error))
      })
    })
  });
}

/**
 * This module evaluates whether the user logged in can create the required tables for this example (actions.tables.contacts and actions.tables.secrets).
 * If the policy allows it, the module executes the call
 */
function prepareTables(sdk) {
  let query = [
    {
      entityId: id,
      entityType: type,
      field: tablesContacts,
      method: 'write'
    },
    {
      entityId: id,
      entityType: type,
      field: tablesSecrets,
      method: 'write'
    }]
  return sdk.policies.pdp.evaluate(query).then(result => {
    console.log(`result from the PDP evaluation for sql write ${JSON.stringify(result)}`)
    axios.post(sql.host, {
      query: 'SELECT * FROM contacts;'
    }).then(res => {
      if (result[0] && res.data.error && res.data.statusCode !== 403) {
        return axios.post(sql.host, {
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
      return axios.post(sql.host, {
        query: 'SELECT * FROM secrets;'
      })
    }).then(res => {
      if (result[1] && res.data.error && res.data.statusCode !== 403) {
        return axios.post(sql.host, {
          query: "CREATE TABLE secrets (" +
          "SecretID int AUTO_INCREMENT, " +
          "ContactID int, " +
          "Secret VARCHAR(255), " +
          "PRIMARY KEY(SecretID)) "
        })
      }
      return res;
    }).catch(err => {
      throw Error(err)
    })
  })
}

module.exports = {
  executeAction,
  prepareTables
}
