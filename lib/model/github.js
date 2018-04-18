var rp = require('request-promise');
const createError = require('http-errors')
var app = require('../agile_conf').application
var conf_template = require('../agile_conf').sdk
var agile = require('agile-sdk')

var options = {
	uri: 'https://api.github.com/orgs/agile-iot/events',
	headers: {
		'User-Agent': 'Request-Promise'
	},
	json: true // Automatically parses the JSON string in the response
};

 /**
  * A module loading github updates for AGILE and applying policies.
  * @module github
  */

/**
* This module instantiates the agile-sdk with the current session token (from the router).
* Then, it evaluates whether the user logged in can execute the github action.
* To verify the policy, the policy for the action "actions.github" for entity equivalent to the current app (in the agile_conf.app object) is used.
* Also, depending on whether the action is a read or a write, the proper arguments are passed to the agile pdp.
* If the policy allows it, the module executes the call and returns an array of updates

*/
var executeAction = function(token, method, args){
  let conf = Object.assign({}, conf_template)
  conf.token = token
  let sdk = agile(conf)

  return new Promise((resolve, reject) => {
    let query = [{
             entityId: app.id,
             entityType: app.type,
             field:`actions.github`,
             method: method
    }]
    sdk.policies.pdp.evaluate(query).then((result)=>{
      console.log(`result from the PDP evaluation ${JSON.stringify(result)}`)
      if(result[0]){
        if(method.toUpperCase() === 'READ'){
          rp(options)
          .then(response => {
            console.log(response)
            if(response && response.length>10){
                response = response.splice(0,10)
            }

            resolve(response)
          })
          .catch(error => {
            reject(createError(500,error))
          });
        } else {
          reject(createError(500,'only read implmented for now'))
        }
      } else {
        reject(createError(403,'Forbidden'))
      }
    }).catch((error)=>{
        reject(createError(500,error))
    })
  });

}

module.exports = {
  executeAction

}
