const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_finance_controller = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    // ================= Date Filter =================
    const whereCreatedAt = {};
    if (start_date) whereCreatedAt.gte = new Date(start_date);
    if (end_date) {
      const endDateObj = new Date(end_date);
      endDateObj.setHours(23, 59, 59, 999);
      whereCreatedAt.lte = endDateObj;
    } else {
      whereCreatedAt.lte = new Date();
    }

    const paymentWhere = {
      status: 'SUCCESS',
      createdAt: whereCreatedAt,
    };

    // ================= Aggregations =================
    const [
      totalSalesAggr,
      totalOrdersCount,
      pending_book_orders,
      inactive_course_orders,
    ] = await Promise.all([
      prisma.payment.groupBy({
        by: ['book_order_id', 'enrollment_id'],
        _sum: { product_price_with_quantity: true },
        where: {
          ...paymentWhere,
          OR: [
            { book_order_id: { not: null } },
            { enrollment_id: { not: null } },
          ],
        },
      }),
      prisma.payment.count({
        where: {
          ...paymentWhere,
          OR: [
            { book_order_id: { not: null } },
            { enrollment_id: { not: null } },
          ],
        },
      }),
      prisma.book_order.count({ where: { status: 'pending' } }),
      prisma.enrollment.count({ where: { status: 'inactive' } }),
    ]);

    let total_book_sell_amount = 0;
    let total_course_sell_amount = 0;

    totalSalesAggr.forEach((group) => {
      const amount = group._sum.product_price_with_quantity || 0;
      if (group.book_order_id) total_book_sell_amount += amount;
      else if (group.enrollment_id) total_course_sell_amount += amount;
    });

    const total_sell = total_book_sell_amount + total_course_sell_amount;
    const average_order_value =
      totalOrdersCount === 0 ? 0 : total_sell / totalOrdersCount;

    // ================= Book & Course Sales =================
    const [bookSalesGroup, courseSalesGroup, allBooks, allCourses] =
      await Promise.all([
        prisma.payment.groupBy({
          by: ['book_order_id'],
          _sum: { product_price_with_quantity: true },
          _count: { _all: true },
          where: { ...paymentWhere, book_order_id: { not: null } },
        }),
        prisma.payment.groupBy({
          by: ['enrollment_id'],
          _sum: { product_price_with_quantity: true },
          _count: { _all: true },
          where: { ...paymentWhere, enrollment_id: { not: null } },
        }),
        prisma.book.findMany({ select: { book_id: true, title: true } }),
        prisma.course.findMany({
          select: { course_id: true, course_title: true },
        }),
      ]);

    // ======== Map Book Sales ========
    const orderIdToBookId = new Map(
      (
        await prisma.book_order.findMany({
          where: {
            order_id: { in: bookSalesGroup.map((b) => b.book_order_id) },
          },
          select: { order_id: true, book_id: true },
        })
      ).map((o) => [o.order_id, o.book_id])
    );

    const bookIdToName = new Map(allBooks.map((b) => [b.book_id, b.title]));
    const book_sales_map = new Map();

    bookSalesGroup.forEach((group) => {
      const book_id = orderIdToBookId.get(group.book_order_id);
      if (!book_id) return;
      const entry = book_sales_map.get(book_id) || {
        book_id,
        book_name: bookIdToName.get(book_id) || 'Unknown',
        total_orders: 0,
        total_amount: 0,
      };
      entry.total_orders += group._count._all;
      entry.total_amount += group._sum.product_price_with_quantity || 0;
      book_sales_map.set(book_id, entry);
    });

    const book_sales = Array.from(book_sales_map.values());

    // ======== Map Course Sales ========
    const enrollIdToCourseId = new Map(
      (
        await prisma.enrollment.findMany({
          where: {
            enrollment_id: { in: courseSalesGroup.map((c) => c.enrollment_id) },
          },
          select: { enrollment_id: true, course_id: true },
        })
      ).map((e) => [e.enrollment_id, e.course_id])
    );

    const courseIdToName = new Map(
      allCourses.map((c) => [c.course_id, c.course_title])
    );
    const course_sales_map = new Map();

    courseSalesGroup.forEach((group) => {
      const course_id = enrollIdToCourseId.get(group.enrollment_id);
      if (!course_id) return;
      const entry = course_sales_map.get(course_id) || {
        course_id,
        course_name: courseIdToName.get(course_id) || 'Unknown',
        total_orders: 0,
        total_amount: 0,
      };
      entry.total_orders += group._count._all;
      entry.total_amount += group._sum.product_price_with_quantity || 0;
      course_sales_map.set(course_id, entry);
    });

    const course_sales = Array.from(course_sales_map.values());

    // ================= Revenue Totals =================
    const totals = await prisma.payment.aggregate({
      _sum: {
        product_price_with_quantity: true,
        paid_amount: true,
        due_amount: true,
        delevery_charge: true,
        discount_amount: true,
        meterial_price: true,
        customer_receivable_amount: true,
        advance_charge_amount: true,
      },
      where: {
        status: 'SUCCESS',
        createdAt: whereCreatedAt,
      },
    });

    const totalPaid = totals._sum.paid_amount || 0;
    const totalDue = totals._sum.due_amount || 0;
    const totalDeliveryCharge = totals._sum.delevery_charge || 0;
    const totalDiscount = totals._sum.discount_amount || 0;
    const totalStoreAmount = totals._sum.product_price_with_quantity || 0;

    // ================== Response ==================
    return responseGenerator(200, res, {
      message: 'Finance data loaded',
      error: false,
      success: true,
      total_book_sell_amount,
      total_course_sell_amount,
      total_sell,
      average_order_value,
      book_sales,
      course_sales,
      pending_book_orders,
      inactive_course_orders,
      totalPaid,
      totalDue,
      totalDeliveryCharge,
      totalDiscount,
      withrawable: totalStoreAmount,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = get_finance_controller;
