'use strict';
const config = require(__base + 'modules/t1t-config');

function index(req, res) {
    if (config.environment.toLowerCase() === 'local') return res.render("./index-dev.ejs", { config: config });
    else return res.render("index", { config: config });
}

module.exports = {
    index: index
};