const clearCookie = require('../../utils/clearCookie');
const responseGenerator = require('../../utils/responseGenerator');

const logout_controller = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    clearCookie(res, 'access_token', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'none',
      path: '/',
      domain: isProduction ? '.enovosoft.com' : undefined,
    });
    clearCookie(res, 'refresh_token', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'none',
      path: '/',
      domain: isProduction ? '.enovosoft.com' : undefined,
    });
    return responseGenerator(200, res, {
      message: 'Logged out successfully',
      error: false,
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = logout_controller;
