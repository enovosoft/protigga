const { default: z } = require("zod");

const add_instractor_validation = z.object({
     name: z.string("Please provide instractor name").min(3).max(100),
     designation: z.string("Please provide instractor designation").min(3).max(100),
     teaching_experience: z.string("Please provide instractor teaching experience").min(3).max(100),
     student_count: z.string("Please provide instractor student count").min(3).max(100),
     academy: z.string("Please provide academy").min(3).max(100),
     image: z.string("Please provide instractor image").url()
})
module.exports = add_instractor_validation