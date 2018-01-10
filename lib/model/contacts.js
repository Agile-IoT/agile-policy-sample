const axios = require('axios');
const createError = require('http-errors')
var app = require('../agile_conf').application
var conf_template = require('../agile_conf').sdk
var agile = require('agile-sdk')

//this list contains ONLY name, number and email (we look for these fields as the policies)
var contactList = [{ name:'max',
   number:'+443254123',
   email:'max@awesomeplace.com'
 },{
   name:'alfred',
   number:'+4432321123',
   email:'alfred@einstein.com'
}]

/**
 * A module loading contacts from memory and applying policies.
 * @module contacts
 */

/**
* This module instantiates the agile-sdk with the current session token (from the router).
* Then, it evaluates whether the user logged in can execute the contacts action.
* To verify the policy, the policy for the action "actions.contacts" for entity equivalent to the current app (in the agile_conf.app object) is used.
* Also, depending on whether the action is a read or a write, the proper arguments are passed to the agile pdp.
* If the policy allows it, the module executes the call
* Also for each element in the contacts array, the policy for "actions.contacts[${field}]" where field is the name of the file used is evaluated.
* This allows for finer access control rules (i.e. you can read only name and email but not number)
*/
var executeAction = function(token, method, args){

  let conf = Object.assign({}, conf_template)
  conf.token = token
  let sdk = agile(conf)

  return new Promise((resolve, reject) => {
    let query = [{
      entityId: app.id,
      entityType: app.type,
      field:`actions.contacts`,
      method: method
    },{
      entityId: app.id,
      entityType: app.type,
      field:`actions.name`,
      method: method
    },{
      entityId: app.id,
      entityType: app.type,
      field:`actions.number`,
      method: method
    },{
      entityId: app.id,
      entityType: app.type,
      field:`actions.email`,
      method: method
    }]

    sdk.policies.pdp.evaluate(query).then((result)=>{
      console.log(`result from the PDP evaluation ${JSON.stringify(result)}`)
      if(method.toUpperCase() === 'READ'){
        if(result[0]){
          var ress = contactList.map((contact)=>{
            let x = {}
            if(result[1]) {
              x.name = contact.name
            }
            if(result[2]) {
              x.number = contact.number
            }
            if (result[3]) {
              x.email = contact.email
            }
            return x
          })
          resolve(ress)

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

module.exports = module.exports = {
  executeAction: executeAction
}
