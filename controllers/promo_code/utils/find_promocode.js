const prisma = require('../../../config/db');

const find_promocode = async (search_details) => {
  const alreadt_exist = await prisma.promo_code.findMany({
    where: {
      ...search_details,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return {
    exist: alreadt_exist.length > 0 ? true : false,
    promocodes: alreadt_exist,
  };
};

module.exports = find_promocode;
