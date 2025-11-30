const shortid = require("shortid")
const prisma = require("../../config/db")
const responseGenerator = require("../../utils/responseGenerator")

const add_instractor_controller = async (req, res, next) => {
     try {
          const {
               name,
               designation,
               teaching_experience,
               student_count,
               academy,
               image,
          } = req.body || {}

          const added_instractor = await prisma.instractor.create({
               data: {
                    instractor_id: shortid.generate(),
                    name,
                    designation,
                    teaching_experience,
                    student_count,
                    academy,
                    image,
               }
          })

          if (added_instractor?.instractor_id) {
               return responseGenerator(201, res, {
                    message: "Instractor added successfully",
                    success: true,
                    error: false,
                    errors: [],
                    instractor: added_instractor
               })
          } else {
               return responseGenerator(400, res, {
                    message: "Instractor not added",
                    success: false,
                    error: true,
                    errors: [],
               })
          }
     } catch (error) {
          return next(error)

     }
}

module.exports = add_instractor_controller