const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_single_user_details_controller = async (req, res, next) => {
  try {
    const decoded_user = req.decoded_user;
    //     ======== search
    const user = await prisma.user.findFirst({
      where: { user_id: decoded_user?.user_id },
      select: {
        user_id: true,
        name: true,
        phone: true,
        payments: {
          select: {
            product_price_with_quantity: true,
            meterial_price: true,
            discount_amount: true,
            discount_amount: true,
            paid_amount: true,
            due_amount: true,
            willCustomerGetAmount: true,
            customer_receivable_amount: true,
            delevery_charge: true,
            advance_charge_amount: true,
            tran_date: true,
            card_type: true,
            card_issuer: true,
            store_amount: true,
            card_category: true,
            currency: true,
            status: true,
            method: true,
            book_order: true,
            course_enrollment: true,
            Txn_ID: true,
            promo_code: true,
          },
        },
        enrollments: {
          select: {
            payment: {
              select: {
                product_price_with_quantity: true,
                meterial_price: true,
                discount_amount: true,
                discount_amount: true,

                paid_amount: true,
                due_amount: true,
                willCustomerGetAmount: true,
                customer_receivable_amount: true,
                delevery_charge: true,
                advance_charge_amount: true,
                tran_date: true,
                card_type: true,
                card_issuer: true,
                store_amount: true,
                card_category: true,
                currency: true,
                status: true,
                method: true,
                book_order: true,
                course_enrollment: true,
                Txn_ID: true,
                promo_code: true,
              },
            },
            course: {
              include: {
                exams: true,
              },
            },
          },
        },
        book_orders: {
          select: {
            payment: {
              select: {
                product_price_with_quantity: true,
                meterial_price: true,
                discount_amount: true,
                discount_amount: true,

                paid_amount: true,
                due_amount: true,
                willCustomerGetAmount: true,
                customer_receivable_amount: true,
                delevery_charge: true,
                advance_charge_amount: true,
                tran_date: true,
                card_type: true,
                card_issuer: true,
                store_amount: true,
                card_category: true,
                currency: true,
                status: true,
                method: true,
                book_order: true,
                course_enrollment: true,
                Txn_ID: true,
                promo_code: true,
              },
            },
            book: true,
          },
        },
      },
    });

    //     check : if exist
    if (!user?.user_id)
      return responseGenerator(404, res, {
        message: 'user not found',
        success: false,
        error: true,
      });
    if (user?.user_id)
      return responseGenerator(200, res, {
        message: 'user found',
        success: true,
        error: false,
        user,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_single_user_details_controller;
