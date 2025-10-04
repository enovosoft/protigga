const prisma = require('../config/db');
const responseGenerator = require('../utils/responseGenerator');

const is_admin = async (req, res, next) => {
  try {
    const user = req.decoded_user;
    const find_role = await prisma.role.findMany({
      where: { phone: user?.phone, user_id: user?.user_id },
    });

    let is_admin = find_role.some((role) => role.role_code === 100);
    req.is_admin = is_admin;
    if (is_admin) {
      return next();
    }
    if (!is_admin)
      return responseGenerator(401, res, {
        success: false,
        error: true,
        message: 'You must hold the admin role.',
      });
  } catch (error) {}
};

module.exports = is_admin;
