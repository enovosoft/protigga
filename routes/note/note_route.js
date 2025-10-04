const add_note_controller = require('../../controllers/note/add_note_controller');
const delete_note_controller = require('../../controllers/note/delete_note_controller');
const get_all_notes = require('../../controllers/note/get_all_notes');
const get_single_note = require('../../controllers/note/get_single_note');
const update_note_controller = require('../../controllers/note/update_note_controller');
const auth_middleware = require('../../middlewares/auth_middleware');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');

const token_regenerator = require('../../middlewares/token_regenerator');
const add_note_validation = require('../../validators/note/add_note_validation');
const delete_note_validation = require('../../validators/note/delete_note_validation');
const update_note_validation = require('../../validators/note/update_note_valudation');

const validate = require('../../validators/utils/validate');

const note_route = require('express').Router();

note_route.get('/notes', get_all_notes);
note_route.get('/notes/:slug', get_single_note);
note_route.post(
  '/note',
  validate(add_note_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  add_note_controller
);
note_route.put(
  '/note',
  validate(update_note_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_note_controller
);
note_route.delete(
  '/note',
  validate(delete_note_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  delete_note_controller
);

module.exports = note_route;
