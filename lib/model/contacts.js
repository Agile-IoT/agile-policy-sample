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
 * This module contains an example of read actions (list contacts) and write accions (add contact) which are mapped by this example from HTTP GET and POST requests
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
      field:`actions.contacts.name`,
      method: method
    },{
      entityId: app.id,
      entityType: app.type,
      field:`actions.contacts.number`,
      method: method
    },{
      entityId: app.id,
      entityType: app.type,
      field:`actions.contacts.email`,
      method: method
    }]

    sdk.policies.pdp.evaluate(query).then((result)=>{
      console.log(`result from the PDP evaluation ${JSON.stringify(result)}`)
      if(method.toUpperCase() === 'READ'){
        evaluateRead(result, resolve, reject)
      } else if (method.toUpperCase() === 'WRITE') {
        evaluateWrite(result, args, resolve, reject)
      } else {
        console.log(` got a weird method: ${method}`)
        console.log(` with these arguments ${JSON.stringify(args)}`)
        reject(createError(500,'unsuported method. Only read and writes are allowed'))

      }
    }).catch((error)=>{
        reject(createError(500,error))
    })
  });

}

/**
* This internal function checks that the authenticated user can write to the array of contacts. And if it is possible, it adds it to the list
*/
function evaluateWrite(result, args, resolve, reject){
  console.log(` got a write request with these arguments ${JSON.stringify(args)}`)
  if(Object.keys(args).length > 3 || Object.keys(args).indexOf("name")<0 || Object.keys(args).indexOf("email")<0 || Object.keys(args).indexOf("number")<0  ){
      reject(createError(400,'you must provide (only) name, number and email as arguments for this write method'))
  } else {
    if(result[0]){
      let x = {}
      if(result[1]) {
          x.name = args.name
      }
      if(result[2]) {
        x.number = args.number
      }
      if (result[3]) {
        x.email = args.email
      }
      contactList.push(x)
      resolve(contactList)
    } else {
        reject(createError(403,'Forbidden'))
    }

  }

}

/**
* This internal function checks that the authenticated user can read from to the array of contacts. Depending on which fields the user can read, it returns them or not in the array.
*/

function evaluateRead(result, resolve, reject){

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
    reject(createError(403,'Forbidden'))
  }
}


module.exports = module.exports = {
  executeAction: executeAction
}
