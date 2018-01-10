let host = process.env.AGILE_HOST || 'localhost'
module.exports = {
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
