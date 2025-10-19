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

const price_calculation = async (
  { meterial_type, meterial_details },
  delevery_type,
  inside_dhaka,
  outside_dhaka,
  sundarban_courier,
  res
) => {
  try {
    // ============ destructute data
    const { promo_code_id, quantity } = meterial_details;
    // ------------- find promocode
    const { exist, promocodes } = await find_promocode({
      promo_code_id: promo_code_id ? promo_code_id : '',
      promocode_for: String(meterial_type).toLowerCase(),
    });

    //     ================= check : if promocode exist
    let last_promocode =
      promocodes[promocodes.length - 1] || default_promo_code_info;
    //     ============= find product through product meterial type
    let ADVANCE_AMOUNT = Number(process.env.ADVANCE_AMOUNT);
    const OUTSIDE_DHAKA_CHARGE = Number(process.env.OUTSIDE_DHAKA_CHARGE);
    const INSIDE_DHAKA_CHARGE = Number(process.env.INSIDE_DHAKA_CHARGE);
    const SUNDORBAN_CHARGE = Number(process.env.SUNDORBAN_CHARGE);

    let product_price = 0;
    let product_price_with_quantity = 0;
    let calculated_amount = 0; // ✅
    let discount = 0;
    let due_amount = 0;
    let willCustomerGetAmount = false;
    let delevery_charge = 0; // ✅
    let customer_receivable_amount = 0;
    let advance_charge_amount = 0;
    let meterial_name = '';
    // let after_discounted_amount = 0;

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
        product_price = book.price;
        meterial_name = book.title;
        product_price_with_quantity = book.price * Number(quantity);
      }
    }

    // book part and cod
    if (
      meterial_type === 'book'
      // && String(delevery_type).toLowerCase() == 'cod'
    ) {
      // -----------------
      if (inside_dhaka || outside_dhaka || sundarban_courier)
        last_promocode = default_promo_code_info;
      // -------------
      if (inside_dhaka && !outside_dhaka && !sundarban_courier) {
        delevery_charge = INSIDE_DHAKA_CHARGE;
        advance_charge_amount = ADVANCE_AMOUNT;
      } else if (outside_dhaka && !sundarban_courier && !inside_dhaka) {
        advance_charge_amount = ADVANCE_AMOUNT;
        delevery_charge = OUTSIDE_DHAKA_CHARGE;
      } else if (sundarban_courier && !inside_dhaka && !outside_dhaka) {
        calculated_amount += SUNDORBAN_CHARGE;
        delevery_charge = SUNDORBAN_CHARGE;
      } else {
        calculated_amount = calculated_amount;
      }
    }
    // ----------------------
    if (advance_charge_amount > product_price_with_quantity) {
      willCustomerGetAmount = true;
      customer_receivable_amount =
        advance_charge_amount - product_price_with_quantity;
      due_amount = 0;
    } else {
      due_amount = product_price_with_quantity - advance_charge_amount;
      willCustomerGetAmount = false;
      customer_receivable_amount = 0;
    }
    // ----------- course part
    if (meterial_type === 'course') {
      const { exist, searched_data } = await find_course_by_slug({
        course_id: meterial_details.product_id,
      });

      if (exist) {
        product_price = searched_data.price;
        product_price_with_quantity = searched_data.price;
        meterial_name = searched_data.course_title;
      }
    }

    // ===================== discount - calculation
    // Check if amount meets minimum purchase requirement
    if (product_price_with_quantity >= last_promocode.Min_purchase_amount) {
      if (last_promocode.Discount_type === 'fixed') {
        discount = last_promocode.Discount;
      } else if (last_promocode.Discount_type === 'percentage') {
        discount =
          (product_price_with_quantity * last_promocode.Discount) / 100;
        // Apply max discount limit
        if (discount > last_promocode.Max_discount_amount) {
          discount = last_promocode.Max_discount_amount;
        }
      }
    }
    //     ===== after discount
    discount = Math.round(discount);
    return {
      product_price,
      quantity,
      product_price_with_quantity,
      calculated_amount:
        product_price_with_quantity -
        discount +
        delevery_charge +
        advance_charge_amount,
      discount,
      due_amount,
      willCustomerGetAmount,
      customer_receivable_amount,
      delevery_charge,
      advance_charge_amount,
      meterial_name,
      promocode: last_promocode,
    };
  } catch (error) {
    console.log(error);
    throw new Error('calculation error/database error');
  }
};

module.exports = price_calculation;
