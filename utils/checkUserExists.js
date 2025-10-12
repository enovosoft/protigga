const prisma = require('../config/db');

const checkUserExists = async (data) => {
  const user = await prisma.user.findFirst({
    where: { ...data },
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
