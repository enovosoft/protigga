const prisma = require('../config/db');
const find_course_by_slug = require('../controllers/course/utils/find_course_by_slug');
const checkUserExists = require('../utils/checkUserExists');
const responseGenerator = require('../utils/responseGenerator');

const check_is_admin_enrollment_existance_and_expiry_date = async (
  req,
  res,
  next
) => {
  try {
    req.accessible = false;

    const { slug } = req.params || '';
    const { exist, searched_data: course } = await find_course_by_slug({
      slug,
    });
    //
    if (!exist)
      return responseGenerator(404, res, {
        message: 'course info not found',
        error: true,
        success: false,
      });
    // ===============================

    const decoded_user = req.decoded_user;

    // ============= find user data
    const { user } = await checkUserExists({
      user_id: decoded_user.user_id,
    });

    // ============= find user role data
    const role_data = await prisma.role.findFirst({
      where: { user_id: decoded_user.user_id },
      orderBy: {
        createdAt: 'desc',
      },
    });
    // ============= if admin, allow directly
    if (
      role_data &&
      role_data.role_code === 100 &&
      role_data.role === 'admin'
    ) {
      req.accessible = true;
      return next();
    }

    // ============= find enrollment data (for normal users/ student)
    const enrollmentData = await prisma.enrollment.findFirst({
      where: {
        user_id: user.user_id,
        course_id: course?.course_id,
      },
      include: {
        payment: true,
        course: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // ============= check enrollment existence and expiry
    if (!enrollmentData) {
      return responseGenerator(403, res, {
        message: 'You are not enrolled in this course.',
        error: true,
        success: false,
      });
    }
    // ============= check payment data
    console.log(enrollmentData?.enrollment_status);
    console.log(enrollmentData?.payment?.status);
    if (
      enrollmentData?.enrollment_status !== 'success' ||
      enrollmentData?.payment?.status !== 'SUCCESS'
    ) {
      return responseGenerator(403, res, {
        message: 'Please complete your enrollment',
        error: true,
        success: false,
      });
    }
    // ============= check expire
    const isExpired = new Date(enrollmentData?.expiry_date) <= new Date();
    if (isExpired) {
      return responseGenerator(403, res, {
        message: 'Your enrollment has expired.',
        error: true,
        success: false,
      });
    }
    // ================ check is blocked or not
    if (enrollmentData?.is_blocked) {
      return responseGenerator(403, res, {
        message: 'Your enrollment Has blocked by admin.',
        error: true,
        success: false,
      });
    }
    // ============= all checks passed
    req.accessible = true;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = check_is_admin_enrollment_existance_and_expiry_date;
