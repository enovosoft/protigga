const shortid = require('shortid');
const prisma = require('../../../config/db');
const save_order_object_validation_schema = require('./save_order_object_validation');
const validate_schema = require('../../../validators/utils/validate_schema');
const find_book = require('../utils/find_book');

const save_book_order = async (material_details, next) => {
  try {
    // ================= Validate request
    const { success, message, errors } = validate_schema(
      save_order_object_validation_schema,
      material_details
    );

    if (!success) {
      return { success, message, error: true, errors };
    }

    // ================= Extract data
    const {
      user_id,
      product_price,
      alternative_phone,
      quantity,
      address,
      Txn_ID,
      after_calulated_data,
      promo_code_id,
      product_id,
      wp_number = '--',
      fb_name = '--',
    } = material_details || {};

    // ---------------- Check if book exists
    const { exist, book } = await find_book({ book_id: product_id });
    if (!exist) {
      return {
        success: false,
        error: true,
        message: 'Invalid book details',
      };
    }

    // ---------------- Check stock
    if (book.stock < quantity) {
      return {
        success: false,
        error: true,
        message: `Insufficient quantity exist. please purchase ${book.stock} item or order after re-stock`,
      };
    }
    if (book.stock === 0) {
      return {
        success: false,
        error: true,
        message: 'Stocked out',
      };
    }

    // ================= Prepare order & payment data
    const order_id = shortid.generate();

    // ----------- Payment Data
    const paymentData = {
      product_price_with_quantity:
        after_calulated_data.product_price_with_quantity,
      payment_id: shortid.generate(),
      meterial_price: parseFloat(after_calulated_data.product_price),
      discount_amount: after_calulated_data.discount,
      paid_amount: after_calulated_data.paid_amount,
      due_amount: after_calulated_data.due_amount,
      willCustomerGetAmount: after_calulated_data.willCustomerGetAmount,
      customer_receivable_amount:
        after_calulated_data?.customer_receivable_amount,
      delevery_charge: after_calulated_data?.delevery_charge,
      advance_charge_amount: after_calulated_data?.advance_charge_amount || 0,
      user: { connect: { user_id } },
      Txn_ID,
      method: after_calulated_data.method || 'SSL_COMMERZ',
      purpose: 'book order',
      remarks: 'Book order',
      promo_code_id: null, // default
    };

    // ----------- Connect promo code only if exists in DB
    if (promo_code_id) {
      const promoExists = await prisma.promo_code.findUnique({
        where: { promo_code_id },
      });
      if (promoExists) {
        paymentData.promo_code = { connect: { promo_code_id } };
        paymentData.promo_code_id = promo_code_id;
      }
    }

    // ================= Create order
    const created_order = await prisma.book_order.create({
      data: {
        order_id,
        product_price: after_calulated_data.product_price || product_price,
        alternative_phone,
        quantity,
        Txn_ID,
        wp_number,
        fb_name,
        book: { connect: { book_id: product_id } },
        address,
        status: after_calulated_data?.status || 'pending',
        user: { connect: { user_id } },
        payment: { create: paymentData },
      },
    });

    // ---------------- Update stock
    await prisma.book.update({
      where: { book_id: product_id },
      data: { stock: Number(book.stock) - Number(quantity) },
    });

    // ---------------- Return success
    if (!created_order?.order_id) {
      return {
        success: false,
        error: true,
        message: 'Failed to place order',
        errors,
      };
    }

    return {
      success: true,
      error: false,
      message: 'Order placed successfully',
      created_order,
      errors,
    };
  } catch (error) {
    return next(error);
  }
};

module.exports = save_book_order;
