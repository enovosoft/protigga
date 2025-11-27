// utils/cookie_setter.js
const cookie_setter = (res, token, cookieName = 'token', options = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(cookieName, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: options.maxAge || 1000 * 60 * 60 * 24,
    path: '/',
    domain: isProduction ? '.protigya.com' : undefined,
    ...options,
  });
};

module.exports = cookie_setter;
