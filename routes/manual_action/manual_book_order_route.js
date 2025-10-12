const manual_book_order_controller = require('../../controllers/manual_action/manual_book_order_controller');
const is_admin = require('../../middlewares/is_admin');
const manual_book_order_validation = require('../../validators/manual_action/manual_order_book_validation');
const validate = require('../../validators/utils/validate');

const manual_book_order_route = require('express').Router();
manual_book_order_route.post(
  '/manual/book-order',
  validate(manual_book_order_validation),
  is_admin,
  manual_book_order_controller
);

module.exports = manual_book_order_route;
