const prisma = require('../../config/db');
const bcrypt = require('bcrypt');
const checkUserExists = require('../../utils/checkUserExists');
const responseGenerator = require('../../utils/responseGenerator');
const normalizePhoneNumber = require('../../utils/normalize_phone_number');
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
    //================== update: password
    const updated_data = await prisma.user.update({
      where: { phone },
      data: {
        password: bcrypt.hashSync(password, 10),
      },
    });
    if (updated_data?.phone)
      return responseGenerator(201, res, {
        success: true,
        error: false,
        message: 'password updated successfully',
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = change_password_controller;
