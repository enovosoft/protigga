const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const check_chapter_existance = require('./utils/check_chapter_existance');

const update_chapter_controller = async (req, res, next) => {
  try {
    const { chapter_id, title } = req.body || {};
    const { exist } = await check_chapter_existance({ chapter_id });

    //      =========== check =======
    if (!exist)
      return responseGenerator(404, res, {
        message: 'invalid chapter details',
        error: true,
        success: false,
      });
    //  update part
    const updated_data = await prisma.chapter.update({
      where: {
        chapter_id,
      },
      data: {
        title,
      },
    });
    //     reponse

    return responseGenerator(updated_data?.chapter_id ? 201 : 500, res, {
      message: updated_data?.chapter_id
        ? 'chapter updated'
        : 'unavle to update chapter',
      error: !updated_data?.chapter_id ? false : true,
      success: updated_data?.chapter_id ? true : false,
      chapter: updated_data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = update_chapter_controller;
