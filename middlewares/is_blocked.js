const checkUserExists = require('../utils/checkUserExists');
const responseGenerator = require('../utils/responseGenerator');

const is_blocked = async (req, res, next) => {
  try {
    const { phone } = req.decoded_user ? req.decoded_user : req.body || {};
    const { user } = await checkUserExists({ phone });
    if (user?.is_blocked) {
      return responseGenerator(400, res, {
        message: 'Your account blocked by authority. please contact with them.',
        error: true,
        success: false,
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
module.exports = is_blocked;
