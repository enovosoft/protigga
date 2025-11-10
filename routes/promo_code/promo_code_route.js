const add_promo_code_controller = require('../../controllers/promo_code/add_promo_code_controller');
const check_promo_code_controller = require('../../controllers/promo_code/check_promo_code_controller');
const delete_promocode_controller = require('../../controllers/promo_code/delete_promocode_controller');
const get_all_promocode_controller = require('../../controllers/promo_code/get_all_promocode_controller');
const update_promocode_controller = require('../../controllers/promo_code/update_promocode_controller');
const auth_middleware = require('../../middlewares/auth_middleware');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');
const token_regenerator = require('../../middlewares/token_regenerator');
const add_promo_code_validation = require('../../validators/promo_code/add_promo_code_validarion');
const check_promocode_validation = require('../../validators/promo_code/check_promocode_validation');
const delete_promocode_validation = require('../../validators/promo_code/delete_promo_code_validation');
const update_promo_code_validarion = require('../../validators/promo_code/update_promo_code_validarion');

const validate = require('../../validators/utils/validate');

const promo_code_route = require('express').Router();

promo_code_route.post(
  '/check-promo-code',
  validate(check_promocode_validation),
  check_promo_code_controller
);
promo_code_route.get(
  '/promocodes',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  get_all_promocode_controller
);
promo_code_route.post(
  '/promo-code',
  validate(add_promo_code_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  add_promo_code_controller
);
promo_code_route.put(
  '/promo-code',
  validate(update_promo_code_validarion),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_promocode_controller
);
promo_code_route.delete(
  '/promo-code',
  validate(delete_promocode_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  delete_promocode_controller
);
module.exports = promo_code_route;
