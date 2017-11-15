'use strict';

const express = require('express');
const ctrlToken = require('./token.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/token')
          .post(ctrlToken.exchangeToken);

    // Register our routes
    app.use(router);
};
