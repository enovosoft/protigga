const jwt = require('jsonwebtoken');

const token_generator = (data, day = 1, JWT_TOKEN_SECRET) => {
  var token = jwt.sign({ ...data }, JWT_TOKEN_SECRET, {
    expiresIn: `${day}d`,
  });
  return token;
};

module.exports = {
  token_generator,
};
