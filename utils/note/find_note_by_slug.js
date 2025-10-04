const prisma = require('../../config/db');

const find_note_by_slug = async (slug) => {
  const searched_data = await prisma.note.findFirst({
    where: {
      slug,
    },
  });

  return {
    exist: searched_data?.id ? true : false,
    searched_data,
  };
};

module.exports = find_note_by_slug;
