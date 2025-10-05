// utils/cookie_setter.js
const cookie_setter = (res, token, cookieName = 'token', options = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // res.cookie(cookieName, token, {
  //   httpOnly: true, // secure from JS
  //   secure: isProduction, // HTTPS required for prod
  //   sameSite: isProduction ? 'none' : 'lax', // allow cross-domain
  //   maxAge: options.maxAge || 1000 * 60 * 60 * 24, // 1 day default
  //   path: '/', // root path
  //   ...options,
  // });
  res.cookie(cookieName, token, {
    sameSite: 'none', // allow cross-site
    maxAge: options?.maxAge || 1000 * 60 * 60 * 24,
    path: '/',
  });
};

module.exports = cookie_setter;
