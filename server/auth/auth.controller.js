'use strict';
const config = require(__base + 'modules/t1t-config');
const resUtil = require('../util/response.util');
const srvProxy = require('./auth.service.js');

function proxy(req, res) {
    const options = {
        verb: req.method,
        uri: req.originalUrl,
        payload: req.body,
        headers: req.headers,
        authorization: req.headers.authorization
    };

    srvProxy.proxy(options).then(response => {
        // console.log(response);
        return res.status(response.statusCode).json(response.body);
    }, err => {
        console.log(err);
        return resUtil.error(err, res);
    });
}

module.exports = {
    proxy: proxy
};