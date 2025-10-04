const prisma = require('../../config/db');
const find_note_by_slug = require('../../utils/note/find_note_by_slug');
const responseGenerator = require('../../utils/responseGenerator');

const delete_note_controller = async (req, res, next) => {
  try {
    const { slug, note_id } = req.body || {};
    // ================== search : by slug
    const { exist } = await find_note_by_slug(slug);
    if (!exist)
      return responseGenerator(404, res, {
        message: 'Data not found',
        error: true,
        success: false,
      });
    // =============== delete : note
    const deleted_note = await prisma.note.delete({
      where: {
        slug,
      },
    });

    // ============== check : if not deleted
    if (!deleted_note)
      return responseGenerator(500, res, {
        message: 'something went wrong',
        success: false,
        error: true,
      });
    // ============== check : if deleted
    if (deleted_note)
      return responseGenerator(500, res, {
        message: 'note deleted successfully',
        success: true,
        error: false,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_note_controller;
