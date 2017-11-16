'use strict';
const config = require('../../modules/t1t-config');


function defaultHeaders() {
    return {
        Accept: 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-GB,en;q=0.8,en-US;q=0.6,nl;q=0.4,fr;q=0.2,de;q=0.2',
        apikey: config.gw.apikey,
        'Content-Type': 'application/json'
    }
}

module.exports = {
    defaultHeaders: defaultHeaders,
};


