// Require the package
const { Onfido, Region, OnfidoApiError } = require('@onfido/api');

// Configure with your API token, and region if necessary
const onfido = new Onfido({
    apiToken: process.env.ONFIDO_API_TOKEN
    // Defaults to Region.EU (api.onfido.com), supports Region.US and Region.CA
    // region: Region.US
});

module.exports = onfido;