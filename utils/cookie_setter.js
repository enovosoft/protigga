// utils/cookie_setter.js
const cookie_setter = (res, token, cookieName = 'token', options = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(cookieName, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'lax' : 'none',
    maxAge: options.maxAge || 1000 * 60 * 60 * 24, // 1 day
    path: '/',
    domain: isProduction ? '.protigya.com' : undefined, // local e auto skip korbe
    ...options,
  });
};

module.exports = cookie_setter;
