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
    let query = [{
      entityId: app.id,
      entityType: app.type,
      field: `actions.sql`,
      method: method
    }]
    sdk.policies.pdp.evaluate(query).then((result) => {
      console.log(`result from the PDP evaluation ${JSON.stringify(result)}`)
      if (result[0]) {
        axios.post(sql, {
          query: 'SELECT * FROM user'
        })
        .then(function (response) {
          resolve(response.data.results);
        })
        .catch(function (error) {
          reject(createError(500, error))
        });
      } else {
        reject(createError(403, 'Forbidden'))
      }
    }).catch((error) => {
      reject(createError(500, error))
    })
  });

}

module.exports = {
  executeAction
}
