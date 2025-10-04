const jwt = require('jsonwebtoken');
const getCookieFromReq = require('../utils/getCookieFromReq');
const { token_generator } = require('../utils/token_generator');
const cookie_setter = require('../utils/cookie_setter');
const checkUserExists = require('../utils/checkUserExists');

const token_regenerator = async (req, res, next) => {
  try {
    const access_token = getCookieFromReq(req, 'access_token');
    const refresh_token = getCookieFromReq(req, 'refresh_token');

    if (!access_token && !refresh_token) {
      return responseGenerator(401, res, {
        success: false,
        message: 'No tokens found in cookies',
      });
    }
    // ================= ==== = = = == = ==
    let decodedRefresh;
    // =============== regenerate
    if ((!access_token && refresh_token) || (access_token && refresh_token)) {
      try {
        decodedRefresh = jwt.verify(
          refresh_token,
          process.env.REFRESH_TOKEN_SECRET
        );
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return responseGenerator(401, res, {
            success: false,
            message: 'Refresh token expired, login required',
          });
        }
        return responseGenerator(401, res, {
          success: false,
          message: 'Invalid refresh token',
        });
      }
    }

    // ======== generate: access token
    if (decodedRefresh) {
      const find_user = await checkUserExists({ phone: decodedRefresh?.phone });
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
      return next();
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = token_regenerator;
