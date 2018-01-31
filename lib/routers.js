var express = require('express')
var util = require('./util')
var session = require('express-session')
var url = require('url')
var conf_template = require('./agile_conf').sdk
var agile = require('agile-sdk')
var model = util.list_model_modules()

 /**
  * A module with basic routes for the site.
  * @module router
  */
 var router = express.Router()


router.get('/', function (req, res) {
  if(req.query.token){
    //create agile-sdk
    let conf = Object.assign({}, conf_template)
    conf.token = req.query.token
    console.log(`conf ${JSON.stringify(conf)}`)
    let sdk = agile(conf)
    //check if token is correct for any AGILE user, a.k.a authenticate
    sdk.idm.user.getCurrentUserInfo().then((user)=>{
      //if user is authenticated, then set token and user information
      req.session.token = req.query.token
      req.session.user = user
      console.log(`token found: ${req.session.token }`)
      console.log(`user: ${JSON.stringify(user)}`)

      res.render('pages/index',{message: `you have been logged in as ${user.user_name} with authentication type ${user.auth_type}`, model_pages: util.find_pages_model() });
    }).catch((error) => {
      res.render('pages/error',{message: error});
    })
  } else {
    res.render('pages/error',{message: 'please provide a token in as a query argument in your request'});
  }

})

router.get('/action/:action', function (req, res) {
   if(req.session.token){
     if( model.hasOwnProperty(req.params.action)){
       model[req.params.action].executeAction(req.session.token, util.mapVerbToReadWrite(req.method), req.body).then((result)=>{
          res.render(`pages_model/${req.params.action}`,{result});
       }).catch((error)=>{
          res.render('pages/error',{message: error});
       })
     } else {
       res.render('pages/error',{message: 'action not defined (you could add a new one by adding files to lib/model and to lib/views/pages_model)'});

     }

   } else {
     res.redirect('/');
   }
})

module.exports = router
