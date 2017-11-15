'use strict';
const config = require(__base + 'modules/t1t-config');
const reqUtil = require('../util/request.util');
const rp = require('request-promise');

function exchangeToken(kcToken) {
    return Promise.resolve({ statusCode: 200, body: kcToken });


    // TODO actual token exchange
    // const endpoint = config.gw.auth.uri + '/login/token/exchange';
    //
    // let requestOptions = {
    //     method: 'POST',
    //     uri: endpoint,
    //     followRedirect : false,
    //     simple: false,
    //     resolveWithFullResponse: true,
    //     json: true,
    //     body: kcToken,
    //     headers: reqUtil.defaultHeaders()
    // };
    //
    // return rp(requestOptions);
}


module.exports = {
    exchangeToken: exchangeToken,
};
