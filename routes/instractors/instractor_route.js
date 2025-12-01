const instractor_route = require('express').Router();
const add_instractor_controller = require('../../controllers/instractors/add_instractor_controller');
const delete_instractor_controller = require('../../controllers/instractors/delete_instractor_controller');
const get_all_instractor_controller = require('../../controllers/instractors/get_all_instractor_controller');
const update_instractor_controller = require('../../controllers/instractors/update_instractor_controller');
const auth_middleware = require('../../middlewares/auth_middleware');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');
const token_regenerator = require('../../middlewares/token_regenerator');
const add_instractor_validation = require('../../validators/instractors/add_instractor_validation');
const update_instractor_validation = require('../../validators/instractors/update_instractor_validation');
const validate = require('../../validators/utils/validate');

instractor_route.get('/instructors', get_all_instractor_controller);
instractor_route.post(
  '/instractor',
  validate(add_instractor_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  add_instractor_controller
);
instractor_route.put(
  '/instractor',
  validate(update_instractor_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_instractor_controller
);
instractor_route.delete(
  '/instractor',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  delete_instractor_controller
);
module.exports = instractor_route;
