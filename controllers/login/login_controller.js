const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const bcrypt = require('bcrypt');
const { token_generator } = require('../../utils/token_generator');
const cookie_setter = require('../../utils/cookie_setter');
const login_controller = async (req, res, next) => {
  try {
    const { phone, password } = req.body || {};
    //================= find :u ser
    const find_user = await prisma.user.findFirst({
      where: { phone },
      select: {
        user_id: true,
        name: true,
        phone: true,
        is_verified: true,
        is_blocked: true,
        password: true,
        roles: {
          select: {
            role: true,
            role_code: true,
          },
        },
      },
    });
    console.log(find_user);
    //  ================= check : password
    const isMatch = await bcrypt.compare(password, find_user.password);
    if (!isMatch)
      return responseGenerator(401, res, {
        message: 'Phone or Password incorrect',
        error: true,
        success: false,
      });
    // ============ remove sensitive data
    delete find_user.password;

    // ============ token=====
    const access_token = token_generator(
      find_user,
      10,
      process.env.ACCESS_TOKEN_SECRET
    );
    const refresh_token = token_generator(
      find_user,
      30,
      process.env.REFRESH_TOKEN_SECRET
    );
    // ============ cookie setter
    cookie_setter(res, access_token, 'access_token', {
      maxAge: 1000 * 60 * 60 * 24 * 10,
    });
    cookie_setter(res, refresh_token, 'refresh_token', {
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    // ============= final response
    return responseGenerator(200, res, {
      message: 'Successfully logged in',
      error: false,
      success: true,
      // tokens: {
      //   access_token,
      //   refresh_token,
      // },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = login_controller;
