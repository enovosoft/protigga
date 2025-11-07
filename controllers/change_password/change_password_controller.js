const prisma = require('../../config/db');
const bcrypt = require('bcrypt');
const checkUserExists = require('../../utils/checkUserExists');
const responseGenerator = require('../../utils/responseGenerator');
const normalizePhoneNumber = require('../../utils/normalize_phone_number');
const clearCookie = require('../../utils/clearCookie');
const change_password_controller = async (req, res, next) => {
  try {
    const { phone, password, prev_password } = req.body || {};

    //================== check: prev password correct or not
    const { user } = await checkUserExists({
      phone: normalizePhoneNumber(phone),
    });
    //================== compare: passwrod
    const isMatch = bcrypt.compareSync(prev_password, user.password);

    if (!isMatch)
      return responseGenerator(401, res, {
        message: 'previous password incorrect',
        success: false,
        error: true,
      });

    // ============= check prevpass == newpass
    const is_prev_and_new_matched = bcrypt.compareSync(password, user.password);
    if (is_prev_and_new_matched)
      return responseGenerator(401, res, {
        message: 'previous and new password must be different',
        success: false,
        error: true,
      });

    //================== update: password
    const updated_data = await prisma.user.update({
      where: { phone },
      data: {
        password: bcrypt.hashSync(password, 10),
      },
    });
    if (updated_data?.phone) {
      clearCookie(res, 'access_token');
      clearCookie(res, 'refresh_token');
      return responseGenerator(201, res, {
        success: true,
        error: false,
        message: 'password updated successfully',
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = change_password_controller;
