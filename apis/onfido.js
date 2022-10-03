const axios = require('axios');

let onfido_axios = axios.create({
  headers: {
      'Accept': 'application/json'
  }
});
module.exports = onfido_axios;