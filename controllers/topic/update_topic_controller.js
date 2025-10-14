const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');
const slug_generator = require('../../utils/slug_generator');
const find_topic = require('./utils/find_topic');

const update_topic_controller = async (req, res, next) => {
  try {
    const { chapter_topic_id, title, youtube_url } = req.body || {};
    // =========== check
    const { exist } = await find_topic({ chapter_topic_id });

    //     ============= slug
    let slug = slug_generator(title);
    let { exist: topic_exist } = await find_topic({ slug });
    while (topic_exist) {
      slug = slug_generator(title, false);
      const { exist: exist_ } = await find_topic({ slug });
      topic_exist = exist_;
    }
    // ============ check topic
    if (!exist)
      return responseGenerator(404, res, {
        message: 'invalid topic detailds',
        error: true,
        success: false,
      });

    //  =========== update part
    const updated_topic = await prisma.chapter_topic.update({
      where: {
        chapter_topic_id,
      },
      data: {
        title,
        youtube_url,
        slug,
      },
    });
    // ============ check and reponse back
    return responseGenerator(updated_topic?.chapter_topic_id ? 200 : 500, res, {
      message: updated_topic?.chapter_topic_id
        ? 'updated successfully'
        : 'Failed to update data',
      error: updated_topic?.chapter_topic_id ? false : true,
      success: updated_topic?.chapter_topic_id ? true : false,
      topic: updated_topic,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = update_topic_controller;
