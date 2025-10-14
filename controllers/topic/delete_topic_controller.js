const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const find_topic = require('./utils/find_topic');

const delete_topic_controller = async (req, res, next) => {
  try {
    const chapter_topic_id = req.params.id || '';
    if (!chapter_topic_id)
      return responseGenerator(400, res, {
        message: 'Id missing',
        success: false,
        error: true,
      });
    // ============ check topic
    const { exist } = await find_topic({ chapter_topic_id });

    if (!exist)
      return responseGenerator(404, res, {
        message: 'data not found',
        error: true,
        success: false,
      });
    //  ========== delete part
    const deleted_part = await prisma.chapter_topic.delete({
      where: {
        chapter_topic_id,
      },
    });
    // ============ check and reponse back
    return responseGenerator(deleted_part?.chapter_topic_id ? 200 : 500, res, {
      message: deleted_part?.chapter_topic_id
        ? 'deleted successfully'
        : 'Failed to delete data',
      error: deleted_part?.chapter_topic_id ? false : true,
      success: deleted_part?.chapter_topic_id ? true : false,
      topic: deleted_part,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = delete_topic_controller;
