const express = require('express');

const {
  createPayment,
  ipnListener,
} = require('../../controllers/sslcommerz/sslcommerz_controller');

const failed_sslcommerz_controller = require('../../controllers/sslcommerz/failed_sslcommerz_controller');
const cancel_sslcommerz_controller = require('../../controllers/sslcommerz/cancel_sslcommerz_controller');
const success_sslcommerz_controller = require('../../controllers/sslcommerz/success_sslcommerz_controller');
const validate = require('../../validators/utils/validate');
const ssl_int_validation = require('../../validators/sslcommerz/init_validation');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const token_regenerator = require('../../middlewares/token_regenerator');
const auth_middleware = require('../../middlewares/auth_middleware');
const sslcommerz_route = express.Router();

sslcommerz_route.post(
  '/payment/init',
  validate(ssl_int_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  createPayment
);
sslcommerz_route.post('/payment/ipn', ipnListener);
sslcommerz_route.post('/payment/success', success_sslcommerz_controller);
sslcommerz_route.post('/payment/fail', failed_sslcommerz_controller);
sslcommerz_route.post('/payment/cancel', cancel_sslcommerz_controller);

module.exports = sslcommerz_route;
