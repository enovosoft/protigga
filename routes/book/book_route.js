const add_book_controller = require('../../controllers/book/add_book_controller');
const delete_book_controller = require('../../controllers/book/delete_book_controller');
const get_all_books_controller = require('../../controllers/book/get_all_books_controller');
const get_single_book_controller = require('../../controllers/book/get_single_book_controller');
const update_book_controller = require('../../controllers/book/update_book_controller');
const auth_middleware = require('../../middlewares/auth_middleware');
const check_verified_user = require('../../middlewares/check_verified_user');
const cookie_decoder = require('../../middlewares/cookie_decoder');
const is_admin = require('../../middlewares/is_admin');
const token_regenerator = require('../../middlewares/token_regenerator');
const add_book_validation = require('../../validators/book/add_book_validation');
const delete_book_validation = require('../../validators/book/delete_book_validation');
const update_book_validation = require('../../validators/book/update_book_validation');
const update_note_validation = require('../../validators/note/update_note_valudation');
const validate = require('../../validators/utils/validate');

const book_route = require('express').Router();

book_route.get('/books', get_all_books_controller);
book_route.get('/book/:slug', get_single_book_controller);
book_route.post(
  '/book',
  validate(add_book_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  add_book_controller
);
book_route.put(
  '/book',
  validate(update_book_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  update_book_controller
);
book_route.delete(
  '/book',
  validate(delete_book_validation),
  token_regenerator,
  cookie_decoder,
  check_verified_user,
  auth_middleware,
  is_admin,
  delete_book_controller
);
module.exports = book_route;
