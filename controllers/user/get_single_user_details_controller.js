const prisma = require('../../config/db');
const moment = require('moment-timezone');
const responseGenerator = require('../../utils/responseGenerator');
const bangladeshNow = moment().tz('Asia/Dhaka').toDate();
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
        is_verified: true,
        is_blocked: true,
        createdAt: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
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
            store_amount: false,
            card_category: true,
            currency: true,
            status: true,
            method: true,
            book_order: true,
            course_enrollment: true,
            Txn_ID: true,
          },
        },
        enrollments: {
          where: {
            status: 'active',
            enrollment_status: 'success',
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            payment: {
              where: {
                status: 'SUCCESS',
              },
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
                store_amount: false,
                card_category: true,
                currency: true,
                status: true,
                method: true,
                book_order: true,
                course_enrollment: true,
                Txn_ID: true,
                createdAt: true,
              },
            },

            course: {
              include: {
                live_classes: {
                  where: {
                    is_deleted: false,
                    start_time: {
                      lte: new Date(),
                    },
                    end_time: {
                      gte: new Date(),
                    },
                  },
                },
                announcements: {
                  where: {
                    status: 'active',
                    start_date: {
                      lte: new Date(),
                    },
                    end_date: {
                      gte: new Date(),
                    },
                  },
                },
                exams: {
                  where: {
                    exam_start_time: {
                      lte: new Date(),
                    },
                    exam_end_time: {
                      gte: new Date(),
                    },
                  },
                },
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
                store_amount: false,
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
