const express = require('express');

const {
  createPayment,
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
const validate_ssl_payment = require('../../middlewares/validate_ssl_payment');
const is_blocked = require('../../middlewares/is_blocked');
const ipn_controller = require('../../controllers/sslcommerz/ipn_controller');
const sslcommerz_route = express.Router();

sslcommerz_route.post(
  '/payment/init',
  validate(ssl_int_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  is_blocked,
  auth_middleware,
  createPayment
);
sslcommerz_route.post('/payment/ipn', validate_ssl_payment, ipn_controller);
sslcommerz_route.post(
  '/payment/success',
  validate_ssl_payment,
  success_sslcommerz_controller
);
sslcommerz_route.post(
  '/payment/fail',
  validate_ssl_payment,
  failed_sslcommerz_controller
);
sslcommerz_route.post(
  '/payment/cancel',
  validate_ssl_payment,
  cancel_sslcommerz_controller
);

module.exports = sslcommerz_route;
