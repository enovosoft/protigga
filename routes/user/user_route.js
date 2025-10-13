const get_all_users_controller = require('../../controllers/user/get_all_users_controller');

const get_single_user_details_controller = require('../../controllers/user/get_single_user_details_controller');
const search_user_controller = require('../../controllers/user/search_user_controller');

const auth_middleware = require('../../middlewares/auth_middleware');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');
const token_regenerator = require('../../middlewares/token_regenerator');

const user_route = require('express').Router();
user_route.get(
  '/users',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  get_all_users_controller
);
user_route.get(
  '/user/details',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  get_single_user_details_controller
);
user_route.get(
  '/search/user',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  search_user_controller
);

module.exports = user_route;
