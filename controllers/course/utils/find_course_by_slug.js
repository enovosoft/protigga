const prisma = require('../../../config/db');

const find_course_by_slug = async (search_data) => {
  const searched_data = await prisma.course.findFirst({
    where: {
      ...search_data,
    },
  });

  return {
    exist: searched_data?.id ? true : false,
    searched_data,
  };
};

module.exports = find_course_by_slug;
