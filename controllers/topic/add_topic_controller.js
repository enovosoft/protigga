const shortid = require('shortid');
const prisma = require('../../config/db');
const slug_generator = require('../../utils/slug_generator');
const find_topic = require('./utils/find_topic');
const check_chapter_existance = require('../chapter/utils/check_chapter_existance');
const responseGenerator = require('../../utils/responseGenerator');

const add_topic_controller = async (req, res, next) => {
  try {
    const { chapter_id, title, youtube_url } = req.body || {};
    // =========== check chapter
    const { exist: chapter_exist } = await check_chapter_existance({
      chapter_id,
    });
    // -========= check and response back
    if (!chapter_exist)
      return responseGenerator(404, res, {
        message: 'invalid chapter data',
        success: false,
        error: true,
      });
    //     ============= slug
    let slug = slug_generator(title);
    let { exist } = await find_topic({ slug });
    while (exist) {
      slug = slug_generator(title, false);
      const { exist: exist_ } = await find_topic({ slug });
      exist = exist_;
    }
    // =========== save topic
    const created_topic = await prisma.chapter_topic.create({
      data: {
        chapter_topic_id: shortid.generate(),
        chapter_id,
        title,
        slug,
        youtube_url,
      },
    });
    // ============ check and reponse back
    return responseGenerator(created_topic?.chapter_topic_id ? 200 : 500, res, {
      message: created_topic?.chapter_topic_id
        ? 'added successfully'
        : 'Failed to store data',
      error: created_topic?.chapter_topic_id ? false : true,
      success: created_topic?.chapter_topic_id ? true : false,
      topic: created_topic,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = add_topic_controller;
