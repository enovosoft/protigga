const add_chapter_controller = require('../../controllers/chapter/add_chapter_controller');
const delete_chapter_controller = require('../../controllers/chapter/delete_chapter_controller');
const update_chapter_controller = require('../../controllers/chapter/update_chapter_controller');
const auth_middleware = require('../../middlewares/auth_middleware');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');
const token_regenerator = require('../../middlewares/token_regenerator');
const add_chapter_validation = require('../../validators/chapter/add_chapter_validation');
const update_chapter_validation = require('../../validators/chapter/update_chapter_validation');
const validate = require('../../validators/utils/validate');

const chapter_route = require('express').Router();
chapter_route.post(
  '/chapter',
  validate(add_chapter_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  add_chapter_controller
);
chapter_route.put(
  '/chapter',
  validate(update_chapter_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_chapter_controller
);

chapter_route.delete(
  '/chapter/:chapter_id',
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  delete_chapter_controller
);
module.exports = chapter_route;
