const { z } = require('zod');

const delete_note_validation = z.object({
  slug: z.string('Slug missing'),
  note_id: z.string('Note ID missing'),
});

module.exports = delete_note_validation;
