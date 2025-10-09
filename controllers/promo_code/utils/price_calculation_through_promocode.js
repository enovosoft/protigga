const responseGenerator = require('../../../utils/responseGenerator');
const find_book = require('../../book/utils/find_book');
const find_course_by_slug = require('../../course/utils/find_course_by_slug');
const find_promocode = require('./find_promocode');

const default_promo_code_info = {
  promo_code: '',
  Discount_type: 'fixed',
  Discount: 0,
  Max_discount_amount: 0,
  status: 'active',
};

const price_calculation_through_promocode = async (
  { meterial_type, customer, meterial_details },
  delevery_type,
  inside_dhaka,
  outside_dhaka,
  sundarban_courier,
  res
) => {
  try {
    // ============ destructute data
    const { promo_code_id } = meterial_details;
    // ------------- find promocode
    const { exist, promocodes } = await find_promocode({
      promo_code_id: promo_code_id ? promo_code_id : '',
      promocode_for: meterial_type,
    });

    //     ================= check : if promocode exist
    let last_promocode =
      promocodes[promocodes.length - 1] || default_promo_code_info;
    //     ============= find product through product meterial type
    let original_amount = 0;
    let calculated_amount = 0;
    let after_discounted_amount = 0;
    let due_amount = 0;
    let meterial_name = '';
    // -------------------- if meterial_type === book
    if (meterial_type === 'book') {
      const { exist, book } = await find_book({
        book_id: meterial_details.product_id,
      });
      if (!exist) {
        return responseGenerator(404, res, {
          message: 'Invalid product',
          success: false,
          error: true,
        });
      }

      if (exist) {
        original_amount = book.price;
        meterial_name = book.title;
        calculated_amount = book.price;
        after_discounted_amount = book.price;
      }
    }

    // book part and cod
    if (
      meterial_type === 'book' &&
      String(delevery_type).toLowerCase() == 'cod'
    ) {
      // -------------------- if meterial_type === book & delevery_type == COD
      let ADVANCE_AMOUNT = Number(process.env.ADVANCE_AMOUNT);
      const OUTSIDE_DHAKA_CHARGE = Number(process.env.OUTSIDE_DHAKA_CHARGE);
      const INSIDE_DHAKA_CHARGE = Number(process.env.INSIDE_DHAKA_CHARGE);
      const SUNDORBAN_CHARGE = Number(process.env.SUNDORBAN_CHARGE);
      if (inside_dhaka && !outside_dhaka && !sundarban_courier) {
        calculated_amount = ADVANCE_AMOUNT + INSIDE_DHAKA_CHARGE;
        last_promocode = default_promo_code_info;
        due_amount = original_amount - ADVANCE_AMOUNT;
      } else if (outside_dhaka && !sundarban_courier && !inside_dhaka) {
        calculated_amount = ADVANCE_AMOUNT + OUTSIDE_DHAKA_CHARGE;
        last_promocode = default_promo_code_info;
        due_amount = original_amount - ADVANCE_AMOUNT;
      } else if (sundarban_courier && !inside_dhaka && !outside_dhaka) {
        calculated_amount = original_amount + SUNDORBAN_CHARGE;
        due_amount = 0;
      } else {
        calculated_amount = original_amount;

        due_amount = 0;
      }
    }
    // ----------- course part
    if (meterial_type === 'course') {
      const { exist, searched_data } = await find_course_by_slug({
        course_id: meterial_details.product_id,
      });

      if (exist) {
        original_amount = searched_data.price;
        calculated_amount = searched_data.price;
        meterial_name = searched_data.course_title;
      }
    }

    // ===================== discount - calculation
    let discount = 0;
    // Check if amount meets minimum purchase requirement
    if (original_amount >= last_promocode.Min_purchase_amount) {
      if (last_promocode.Discount_type === 'fixed') {
        discount = last_promocode.Discount;
      } else if (last_promocode.Discount_type === 'percentage') {
        discount = (original_amount * last_promocode.Discount) / 100;
        // Apply max discount limit
        if (discount > last_promocode.Max_discount_amount) {
          discount = last_promocode.Max_discount_amount;
        }
      }
    }
    //     ===== after discount
    after_discounted_amount = calculated_amount - discount;
    return {
      original_amount: Math.ceil(original_amount),
      after_discounted_amount: Math.floor(after_discounted_amount),
      discount: Math.ceil(discount),
      meterial_name,
      due_amount,
      promocode: last_promocode,
    };
  } catch (error) {
    console.log(error);
    throw new Error('calculation error/database error');
  }
};

module.exports = price_calculation_through_promocode;
