'use strict';
const config = require(__base + 'modules/t1t-config');
const reqUtil = require('../util/request.util');
const rp = require('request-promise');
const _ = require('lodash');

function proxy (options) {
    let endpoint = config.gw.web.uri + options.uri;

    let requestOptions = {
        method: options.verb,
        uri: endpoint.replace('/proxy', ''),
        followRedirect : false,
        simple: false,
        resolveWithFullResponse: true,
        json: true
    };

    if (!_.isEmpty(options.payload)) {
        requestOptions.body = options.payload;
        requestOptions.json = true;
    }

    let headers = reqUtil.defaultHeaders();_.omit(options.headers, 'host');
    if (options.authorization) {
        headers['Authorization'] = options.authorization;
    }

    requestOptions.headers = headers;

    return rp(requestOptions);
}

module.exports = {
    proxy: proxy
};