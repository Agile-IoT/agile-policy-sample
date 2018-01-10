var express = require('express')
var router = require('./routers')
var session = require('express-session')
var port = 4000
var app = express()
var randtoken = require('rand-token')
var bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(session({
  secret: randtoken.generate(10),
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false
}))
app.use('/public', express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.use('/', router)
app.listen(port, function () {
  console.log(`Server listening on port ${port}`)
})
