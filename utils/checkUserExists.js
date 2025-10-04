const prisma = require('../config/db');

const checkUserExists = async (data) => {
  const user = await prisma.user.findFirst({ where: { ...data } });

  //   return object: if exist
  if (user?.phone) {
    return {
      exist: true,
      user,
    };
  }
  //   return object: if not exist
  if (!user?.phone) {
    return {
      exist: false,
      user: null,
    };
  }
};

module.exports = checkUserExists;
