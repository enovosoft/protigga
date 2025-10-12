const prisma = require('../../../config/db');

const check_chapter_existance = async (data) => {
  const searched_data = await prisma.chapter.findFirst({
    where: {
      ...data,
    },
  });

  //   return
  return {
    exist: searched_data?.chapter_id ? true : false,
    chapter: searched_data,
  };
};

module.exports = check_chapter_existance;
