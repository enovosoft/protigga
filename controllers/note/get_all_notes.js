const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_all_notes = async (req, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return responseGenerator(200, res, {
      message: 'notes found',
      error: false,
      success: true,
      notes,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_all_notes;
