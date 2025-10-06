const shortid = require('shortid');
const prisma = require('../../config/db');
const slug_generator = require('../../utils/slug_generator');
const responseGenerator = require('../../utils/responseGenerator');
const find_note_by_slug = require('../../utils/note/find_note_by_slug');

const add_note_controller = async (req, res, next) => {
  try {
    const { note_name, note_desc, note_file_link, shared_by } = req.body || {};

    // =============== generate slug
    let slug = slug_generator(note_name);
    //================== search by slug
    const { exist, searched_data } = await find_note_by_slug(slug);
    if (searched_data?.id) slug = slug_generator(note_name, false);
    // ============ add data to db
    const added_data = await prisma.note.create({
      data: {
        note_id: shortid.generate(),
        note_name,
        note_desc,
        note_file_link,
        shared_by,
        slug,
      },
    });

    //================== response : created
    if (added_data?.id)
      return responseGenerator(201, res, {
        message: 'Note created successfully',
        success: true,
        error: false,
        note_details: added_data,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = add_note_controller;
