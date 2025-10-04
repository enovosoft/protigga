const { z } = require('zod');

const delete_note_validation = z.object({
  slug: z.string().nonempty({ message: 'Slug missing' }),
  note_id: z.string().nonempty({ message: 'Note ID missing' }),
});

module.exports = delete_note_validation;
