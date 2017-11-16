'use strict';

function error(error, res) {
    return res.status(error.status).json(error);
}

function ok(body) {
    return create(200, body);
}

function noContent() {
    return create(204, null);
}

function json(res, response) {
    return res.status(response.statusCode).json(response.body);
}


module.exports = {
    error: error,
    ok: ok,
    noContent: noContent,
    json: json
};