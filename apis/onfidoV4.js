const axios = require('axios');

let onfido_v4_axios = axios.create({
  baseURL: 'https://api.onfido.com/v4/',
  headers: {
      'Accept': 'application/json'
  }
})

module.exports = onfido_v4_axios;