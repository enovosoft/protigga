const get_finance_controller = require('../../controllers/finance/get_finance_controller');

const finance_route = require('express').Router();
finance_route.get('/finance', get_finance_controller);
module.exports = finance_route;
