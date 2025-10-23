const prisma = require('../../../config/db');

const update_enrollment_property = async (
  finder_obj = {},
  update_obj = {},
  update_payment_obj = {}
) => {
  try {
    const updated_enrollment = await prisma.enrollment.update({
      where: {
        ...finder_obj,
      },
      data: {
        payment: {
          update: {
            status:
              update_obj.enrollment_status === 'confirmed'
                ? 'SUCCESS'
                : update_obj.enrollment_status === 'cancelled'
                ? 'CANCELLED'
                : update_obj.enrollment_status === 'failed'
                ? 'FAILED'
                : 'PENDING',
            ...update_payment_obj,
          },
        },
      },
    });
    //     ======= return
    return {
      exist: updated_enrollment?.enrollment_id ? true : false,
      success: updated_enrollment?.enrollment_id ? true : false,
      updated_enrollment: updated_enrollment?.enrollment_id
        ? updated_enrollment
        : null,
    };
  } catch (error) {
    throw new Error('Server/database error');
  }
};

module.exports = update_enrollment_property;
