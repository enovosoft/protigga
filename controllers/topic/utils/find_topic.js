const prisma = require('../../../config/db');

const find_topic = async (search_data) => {
  try {
    const topic_data = await prisma.chapter_topic.findFirst({
      where: {
        ...search_data,
      },
    });
    return {
      exist: topic_data?.chapter_topic_id ? true : false,
      topic: topic_data,
    };
  } catch (error) {
    error.status = 500;
    throw new Error('failed to load topic');
  }
};

module.exports = find_topic;
