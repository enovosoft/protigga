const prisma = require('../../../config/db');

const find_course_by_slug = async (search_data) => {
  const clean_search = Object.fromEntries(
    Object.entries(search_data).filter(([_, v]) => v !== undefined)
  );

  if (Object.keys(clean_search).length === 0) {
    return { exist: false, searched_data: null };
  }

  const searched_data = await prisma.course.findFirst({
    where: clean_search,
  });

  return {
    exist: searched_data?.id ? true : false,
    searched_data,
  };
};

module.exports = find_course_by_slug;
