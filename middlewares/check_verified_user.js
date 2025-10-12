const checkUserExists = require('../utils/checkUserExists');
const clearCookie = require('../utils/clearCookie');
const normalizePhoneNumber = require('../utils/normalize_phone_number');
const responseGenerator = require('../utils/responseGenerator');

const check_verified_user = async (req, res, next) => {
  try {
    const { phone } = req.decoded_user ? req.decoded_user : req.body || {};

    // ================= find: user
    const { exist, user: find_user } = await checkUserExists({
      phone: normalizePhoneNumber(phone),
    });
    // ================ check: user exist or not
    if (!exist) {
      clearCookie(res, 'access_token');
      clearCookie(res, 'refresh_token');
      return responseGenerator(404, res, {
        message: 'User not found',
        error: true,
        success: false,
      });
    }
    //============= check: user verified or
    if (!find_user?.is_verified) {
      return responseGenerator(403, res, {
        message: 'Account not verified yet!',
        success: false,
        error: true,
      });
    } else {
      return next();
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = check_verified_user;
