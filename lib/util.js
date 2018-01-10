var fs = require('fs')

/**
 * A module providing common functionalities for this application
 * @module utils
 */

/**
* This function maps HTTP methods (GET, POST, etc) to read and write labels for the policy evaluation.
* In practice this is used to pass the read or write argument to each module loaded in the module executeAction function.
*/
function mapVerbToReadWrite (verb) {
  let read = ['GET']
  let write = ['POST','PUT','DELETE']
  if( read.indexOf(verb) >= 0 ){
    return "READ"
  }
  else {
    return "WRITE"
  }
}


/**
* This function lists all files including pages in the pages_model folder (/views/pages_model)
* This is needed to automatically load all pages in the app
* To add mode pages to render model, just add a page in the /views/pages_model that renders using ejs whatever your model delivers.
*/
function find_pages_model () {
  var files = fs.readdirSync(`${__dirname}/views/pages_model`);
  console.log(`ff ${JSON.stringify(files)} `)

  var names = [];
  files.forEach(function (file) {
      names.push(file.substring(0,file.indexOf('.ejs')))
  });
  return names


}


/**
* list all models found in the /model folder that can be loaded for the application.
* To add more models to the app, just drop a file here that has the same interface the ones included so far.
*/
function list_model_modules() {
  let path = `${__dirname}/model/`
  let files = fs.readdirSync(path)
  let exp = {}
  files.forEach(function (file) {
    if (file != "index.js")
      exp[file.substring(0,file.indexOf('.js'))] = require(path + file)
  });
  return exp
}

module.exports = {
  find_pages_model,
  list_model_modules,
  mapVerbToReadWrite
}
