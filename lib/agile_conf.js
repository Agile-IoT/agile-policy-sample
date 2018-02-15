let host = process.env.AGILE_HOST || 'localhost'
let conf = {
  sdk:{
    token: '',
    api: 'http://' + host + ':8080',
    idm: 'http://' + host + ':3000'
  },
  application: {
      id: "AGILE-OSJS",
      type: "client"
  }
}

if(process.env.INDOCKER){
  conf.sdk.api= 'http://agile-core:8080'
  conf.sdk.idm= 'http://agile-security:3000'
}
console.log(`using config: ${JSON.stringify(conf)}`)

module.exports = conf
