'use strict';
const config = require(__base + 'modules/t1t-config');
const resUtil = require('../util/response.util');
const srvProxy = require('./api.service.js');

function proxy(req, res) {
    const options = {
        verb: req.method,
        uri: req.originalUrl,
        payload: req.body,
        authorization: req.headers.authorization
    };

    srvProxy.proxy(options).then(response => {
        return res.status(response.statusCode).json(response.body);
    }, err => {
        return resUtil.error(err, res);
    });
}

module.exports = {
    proxy: proxy
};