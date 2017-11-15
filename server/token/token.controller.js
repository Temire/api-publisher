'use strict';
const srvToken = require('./token.service.js');
const ResUtil = require('./../util/response.util');

function exchangeToken(req, res) {
    let kcToken = req.body.kcToken;
    srvToken.exchangeToken(kcToken).then(tokenResponse => {
        return ResUtil.json(res, tokenResponse)
    }, err => {
        return ResUtil.error(res, err);
    });
}
module.exports = {
    exchangeToken: exchangeToken
};
