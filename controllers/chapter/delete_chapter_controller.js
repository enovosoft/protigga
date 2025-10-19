const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const check_chapter_existance = require('./utils/check_chapter_existance');

const delete_chapter_controller = async (req, res, next) => {
  try {
    const chapter_id = req.params?.chapter_id?.trim();
    if (!chapter_id) {
      return responseGenerator(400, res, {
        message: 'please follow our sytem rules',
        error: true,
        success: false,
      });
    }

    //     check: valid chapter
    const { exist } = await check_chapter_existance({ chapter_id });

    if (!exist)
      return responseGenerator(404, res, {
        message: 'invalid chapter',
        success: false,
        error: true,
      });

    //     ------------- delete
    // -------------- relation delette
    await prisma.chapter_topic.deleteMany({
      where: {
        chapter_id,
      },
    });
    const deleted_data = await prisma.chapter.delete({
      where: { chapter_id },
    });
    //     reponse
    if (deleted_data?.chapter_id)
      return responseGenerator(deleted_data?.chapter_id ? 200 : 500, res, {
        message: deleted_data?.chapter_id
          ? 'successfully deleted'
          : 'unable to delete',
        success: deleted_data?.chapter_id ? true : false,
        error: !deleted_data?.chapter_id ? true : false,
      });
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_chapter_controller;
