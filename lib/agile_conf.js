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
  },
  sql: {
    host: 'http://' + host + ':3005/query',
    entityId: 'sql-db-3306-agile'
  },
  otp: {
    host: 'http://' + host + ':1400/api/v1/entity',
    entityId: 'agile!@!agile-local',
    entityType: '/user',
    ik: '',
    counter: ''
  }
}

if(process.env.INDOCKER){
  conf.sdk.api= 'http://agile-core:8080'
  conf.sdk.idm= 'http://agile-security:3000'
}
console.log(`using config: ${JSON.stringify(conf)}`)

module.exports = conf
