const add_topic_controller = require('../../controllers/topic/add_topic_controller');
const delete_topic_controller = require('../../controllers/topic/delete_topic_controller');
const update_topic_controller = require('../../controllers/topic/update_topic_controller');
const auth_middleware = require('../../middlewares/auth_middleware');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');
const token_regenerator = require('../../middlewares/token_regenerator');
const add_topic_validations = require('../../validators/topic/add_topic_validations');
const update_topic_validation = require('../../validators/topic/update_topic_validation');
const validate = require('../../validators/utils/validate');

const topic_route = require('express').Router();
topic_route.post(
  '/topic',
  validate(add_topic_validations),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  add_topic_controller
);
topic_route.put(
  '/topic',
  validate(update_topic_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_topic_controller
);
topic_route.delete(
  '/topic/:id',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  delete_topic_controller
);

module.exports = topic_route;
