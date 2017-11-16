'use strict';

const express = require('express');
const ctrlAuth = require('./auth.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/auth/*')
        .all(ctrlAuth.proxy);

    // Register our routes
    app.use(router);
};