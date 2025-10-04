const find_note_by_slug = require('../../utils/note/find_note_by_slug');
const responseGenerator = require('../../utils/responseGenerator');

const get_single_note = async (req, res, next) => {
  try {
    const { slug } = req.params || '';
    //     ============ search note
    const { exist, searched_data } = await find_note_by_slug(slug);
    // ================= check : error renponse
    if (!exist)
      return responseGenerator(404, res, {
        message: 'Not found',
        error: true,
        success: false,
      });
    // ================= check : success renponse
    return responseGenerator(404, res, {
      message: 'Note found',
      error: false,
      success: true,
      note: searched_data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_single_note;
