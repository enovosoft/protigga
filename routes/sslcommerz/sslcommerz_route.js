const express = require('express');

const {
  createPayment,
  ipnListener,
} = require('../../controllers/sslcommerz/sslcommerz_controller');

const failed_sslcommerz_controller = require('../../controllers/sslcommerz/failed_sslcommerz_controller');
const cancel_sslcommerz_controller = require('../../controllers/sslcommerz/cancel_sslcommerz_controller');
const success_sslcommerz_controller = require('../../controllers/sslcommerz/success_sslcommerz_controller');
const sslcommerz_route = express.Router();

sslcommerz_route.post('/payment/init', createPayment);
sslcommerz_route.post('/payment/ipn', ipnListener);
sslcommerz_route.post('/payment/success', success_sslcommerz_controller);
sslcommerz_route.post('/payment/fail', failed_sslcommerz_controller);
sslcommerz_route.post('/payment/cancel', cancel_sslcommerz_controller);

module.exports = sslcommerz_route;
