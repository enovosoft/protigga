const add_announcement_controller = require('../../controllers/announcement/add_announcement_controller');
const delete_enrollment_controller = require('../../controllers/announcement/delete_announcement_controller');
const update_announcement_controller = require('../../controllers/announcement/update_announcement_controller');
const auth_middleware = require('../../middlewares/auth_middleware');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');
const token_regenerator = require('../../middlewares/token_regenerator');
const add_announcement_validation = require('../../validators/announcement/add_announcement_validation');
const update_announcement_validation = require('../../validators/announcement/update_announcement_validation');
const validate = require('../../validators/utils/validate');

const announcement_route = require('express').Router();

announcement_route.post(
  '/announcement',
  validate(add_announcement_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  add_announcement_controller
);
announcement_route.put(
  '/announcement',
  validate(update_announcement_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_announcement_controller
);
announcement_route.delete(
  '/announcement/:announcement_id',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  delete_enrollment_controller
);
module.exports = announcement_route;
