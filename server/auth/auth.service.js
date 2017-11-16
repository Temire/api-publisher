'use strict';
const config = require(__base + 'modules/t1t-config');
const reqUtil = require('../util/request.util');
const rp = require('request-promise');
const _ = require('lodash');

function proxy (options) {
    let endpoint = config.gw.auth.uri + options.uri;

    let requestOptions = {
        method: options.verb,
        uri: endpoint.replace('/auth', ''),
        followRedirect : true,
        resolveWithFullResponse: true,
        json: true,
        simple: false,
        headers: reqUtil.defaultHeaders()
    };

    if (!_.isEmpty(options.payload)) {
        requestOptions.body = options.payload;
    }

    return rp(requestOptions);
}

module.exports = {
    proxy: proxy
};