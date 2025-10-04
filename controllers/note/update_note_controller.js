const prisma = require('../../config/db');
const find_note_by_slug = require('../../utils/note/find_note_by_slug');
const responseGenerator = require('../../utils/responseGenerator');
const slug_generator = require('../../utils/slug_generator');

const update_note_controller = async (req, res, next) => {
  try {
    let { note_name, note_desc, note_file_link, shared_by, slug, note_id } =
      req.body || {};
    //================== search by slug
    const { exist, searched_data } = await find_note_by_slug(slug);
    // ========== check : if not exist
    if (!exist)
      return responseGenerator(404, res, {
        message: 'Note not found',
        error: true,
        success: false,
      });
    //  ====================== check: if exist -> update
    let new_slug = slug_generator(note_name);
    if (searched_data?.note_name !== note_name) {
      const { exist: exis_new } = await find_note_by_slug(new_slug);
      if (exis_new) new_slug = slug_generator(note_name, false);
    }
    const updated_note = await prisma.note.update({
      where: { slug: searched_data?.slug },
      data: {
        note_name,
        note_desc,
        note_file_link,
        shared_by,
        slug: new_slug,
      },
    });
    //=================== check : if update failed
    if (!updated_note?.id)
      return responseGenerator(500, res, {
        message: 'Something went wrong',
        success: false,
        error: true,
      });
    //=================== successfully updated response
    if (updated_note?.id)
      return responseGenerator(200, res, {
        message: 'successfully updated',
        success: true,
        error: false,
        updated_details: updated_note,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = update_note_controller;
