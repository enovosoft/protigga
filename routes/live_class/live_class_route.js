const add_live_class_controller = require('../../controllers/live_class/add_live_class_controller');
const delete_live_class_controller = require('../../controllers/live_class/delete_live_class_controller');
const get_all_live_classes = require('../../controllers/live_class/get_all_live_classes');
const update_live_class_controller = require('../../controllers/live_class/update_live_class_controller');
const auth_middleware = require('../../middlewares/auth_middleware');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');
const token_regenerator = require('../../middlewares/token_regenerator');
const add_live_class_validation = require('../../validators/live_class/add_live_class_validation');
const update_live_class_validation = require('../../validators/live_class/update_live_class_validation');
const validate = require('../../validators/utils/validate');

const live_class_route = require('express').Router();
live_class_route.get(
  '/live-classes',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  get_all_live_classes
);
live_class_route.post(
  '/live-class',
  validate(add_live_class_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  add_live_class_controller
);
live_class_route.put(
  '/live-class',
  validate(update_live_class_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_live_class_controller
);
live_class_route.delete(
  '/live-class/:live_class_id',
  validate(add_live_class_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  delete_live_class_controller
);
module.exports = live_class_route;
