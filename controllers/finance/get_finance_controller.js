const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_finance_controller = async (req, res, next) => {
  try {
    // ================== Date Filter (Corrected) ==================
    const { start_date, end_date } = req.query;

    // This will be our main date filter for 'createdAt'
    const whereCreatedAt = {};
    if (start_date) {
      whereCreatedAt.gte = new Date(start_date);
    }
    if (end_date) {
      // Set end_date to the *end* of the day to include all sales on that day
      const endDateObj = new Date(end_date);
      endDateObj.setHours(23, 59, 59, 999);
      whereCreatedAt.lte = endDateObj;
    } else {
      // Default to 'now' if no end_date is provided
      whereCreatedAt.lte = new Date();
    }

    // This is the final `where` clause for most payment queries
    const paymentWhere = {
      status: 'SUCCESS',
      createdAt: whereCreatedAt,
    };

    // ================== 1. Run All Aggregations in Parallel ==================
    const [
      totalSalesAggr,
      totalOrdersCount,
      pending_book_orders,
      inactive_course_orders,
    ] = await Promise.all([
      // --- Total Book & Course Sales ---
      // Get sums for book/course sales in ONE query
      prisma.payment.groupBy({
        by: ['book_order_id', 'enrollment_id'],
        _sum: { product_price_with_quantity: true },
        where: {
          ...paymentWhere,
          // We only care about payments linked to a book OR a course
          OR: [
            { book_order_id: { not: null } },
            { enrollment_id: { not: null } },
          ],
        },
      }),

      // --- Total Orders Count ---
      prisma.payment.count({
        where: {
          ...paymentWhere,
          OR: [
            { book_order_id: { not: null } },
            { enrollment_id: { not: null } },
          ],
        },
      }),

      // --- Pending/Inactive Orders (Live counts, NO date filter) ---
      prisma.book_order.count({ where: { status: 'pending' } }),
      prisma.enrollment.count({ where: { status: 'inactive' } }),
    ]);

    // ================== 2. Process Parallel Results ==================

    // --- Calculate Totals ---
    let total_book_sell_amount = 0;
    let total_course_sell_amount = 0;

    // Loop over the single groupBy result to calculate totals
    totalSalesAggr.forEach((group) => {
      const amount = group._sum.product_price_with_quantity || 0;
      if (group.book_order_id) {
        total_book_sell_amount += amount;
      } else if (group.enrollment_id) {
        total_course_sell_amount += amount;
      }
    });

    const total_sell = total_book_sell_amount + total_course_sell_amount;

    const average_order_value =
      totalOrdersCount === 0 ? 0 : total_sell / totalOrdersCount;

    const [bookSalesGroup, courseSalesGroup, allBooks, allCourses] =
      await Promise.all([
        // --- Get Book Sales data (Group by Payment) ---
        prisma.payment.groupBy({
          by: ['book_order_id'],
          _sum: { product_price_with_quantity: true },
          _count: { _all: true },
          where: {
            ...paymentWhere,
            book_order_id: { not: null },
          },
        }),
        // --- Get Course Sales data (Group by Payment) ---
        prisma.payment.groupBy({
          by: ['enrollment_id'],
          _sum: { product_price_with_quantity: true },
          _count: { _all: true },
          where: {
            ...paymentWhere,
            enrollment_id: { not: null },
          },
        }),
        // --- Fetch mapping data (needed to link sales to names) ---
        prisma.book.findMany({
          select: { book_id: true, title: true },
        }),
        prisma.course.findMany({
          select: { course_id: true, course_title: true },
        }),
      ]);

    // --- Stitch Book Sales Data Together ---
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
        book_id: book_id,
        book_name: bookIdToName.get(book_id) || 'Unknown',
        total_orders: 0,
        total_amount: 0,
      };

      entry.total_orders += group._count._all;
      entry.total_amount += group._sum.product_price_with_quantity || 0;
      book_sales_map.set(book_id, entry);
    });
    const book_sales = Array.from(book_sales_map.values());

    // --- Stitch Course Sales Data Together ---
    const enrollIdToCourseId = new Map(
      (
        await prisma.enrollment.findMany({
          where: {
            enrollment_id: {
              in: courseSalesGroup.map((c) => c.enrollment_id),
            },
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
        course_id: course_id,
        course_name: courseIdToName.get(course_id) || 'Unknown',
        total_orders: 0,
        total_amount: 0,
      };

      entry.total_orders += group._count._all;
      entry.total_amount += group._sum.product_price_with_quantity || 0;
      course_sales_map.set(course_id, entry);
    });
    const course_sales = Array.from(course_sales_map.values());

    // ================== 4. Daily/Weekly/Monthly Sales (The *Only* Efficient Way) ==================

    const startDateSql = whereCreatedAt.gte || new Date('2000-01-01');
    const endDateSql = whereCreatedAt.lte || new Date();

    // Note: This SQL is for MySQL, as per your schema.
    const [
      daily_book_sales,
      weekly_book_sales,
      monthly_book_sales,
      daily_course_sales,
      weekly_course_sales,
      monthly_course_sales,
    ] = await Promise.all([
      // Daily Books
      prisma.$queryRaw`
        SELECT DATE_FORMAT(p.createdAt, '%Y-%m-%d') as day, b.title as name, SUM(p.product_price_with_quantity) as total
        FROM Payment p
        JOIN Book_order bo ON p.book_order_id = bo.order_id
        JOIN Book b ON bo.book_id = b.book_id
        WHERE p.status = 'SUCCESS' AND p.createdAt >= ${startDateSql} AND p.createdAt <= ${endDateSql}
        GROUP BY day, name
        ORDER BY day`,
      // Weekly Books
      prisma.$queryRaw`
        SELECT DATE_FORMAT(p.createdAt, '%Y-%u') as week, b.title as name, SUM(p.product_price_with_quantity) as total
        FROM Payment p
        JOIN Book_order bo ON p.book_order_id = bo.order_id
        JOIN Book b ON bo.book_id = b.book_id
        WHERE p.status = 'SUCCESS' AND p.createdAt >= ${startDateSql} AND p.createdAt <= ${endDateSql}
        GROUP BY week, name
        ORDER BY week`,
      // Monthly Books
      prisma.$queryRaw`
        SELECT DATE_FORMAT(p.createdAt, '%Y-%m') as month, b.title as name, SUM(p.product_price_with_quantity) as total
        FROM Payment p
        JOIN Book_order bo ON p.book_order_id = bo.order_id
        JOIN Book b ON bo.book_id = b.book_id
        WHERE p.status = 'SUCCESS' AND p.createdAt >= ${startDateSql} AND p.createdAt <= ${endDateSql}
        GROUP BY month, name
        ORDER BY month`,
      // Daily Courses
      prisma.$queryRaw`
        SELECT DATE_FORMAT(p.createdAt, '%Y-%m-%d') as day, c.course_title as name, SUM(p.product_price_with_quantity) as total
        FROM Payment p
        JOIN Enrollment e ON p.enrollment_id = e.enrollment_id
        JOIN Course c ON e.course_id = c.course_id
        WHERE p.status = 'SUCCESS' AND p.createdAt >= ${startDateSql} AND p.createdAt <= ${endDateSql}
        GROUP BY day, name
        ORDER BY day`,
      // Weekly Courses
      prisma.$queryRaw`
        SELECT DATE_FORMAT(p.createdAt, '%Y-%u') as week, c.course_title as name, SUM(p.product_price_with_quantity) as total
        FROM Payment p
        JOIN Enrollment e ON p.enrollment_id = e.enrollment_id
        JOIN Course c ON e.course_id = c.course_id
        WHERE p.status = 'SUCCESS' AND p.createdAt >= ${startDateSql} AND p.createdAt <= ${endDateSql}
        GROUP BY week, name
        ORDER BY week`,
      // Monthly Courses
      prisma.$queryRaw`
        SELECT DATE_FORMAT(p.createdAt, '%Y-%m') as month, c.course_title as name, SUM(p.product_price_with_quantity) as total
        FROM Payment p
        JOIN Enrollment e ON p.enrollment_id = e.enrollment_id
        JOIN Course c ON e.course_id = c.course_id
        WHERE p.status = 'SUCCESS' AND p.createdAt >= ${startDateSql} AND p.createdAt <= ${endDateSql}
        GROUP BY month, name
        ORDER BY month`,
    ]);

    // ================== 5. Top Selling (Re-uses data) ==================
    // This is fast because we're just sorting the array we already built
    const top_books = [...book_sales]
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10);
    const top_courses = [...course_sales]
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10);

    // ================== 6. Revenue Growth (Efficient) ==================
    let revenue_growth = 0;
    if (start_date && end_date) {
      // Only calculate if it's a defined range
      const start = new Date(start_date);
      const end = new Date(end_date);
      const diff = end.getTime() - start.getTime(); // diff in milliseconds

      const prev_start = new Date(start.getTime() - diff - 1); // -1ms to not overlap
      const prev_end = new Date(start.getTime() - 1); // one millisecond before current start

      // Get *total* previous revenue in one aggregate query
      const prevRevenueAggr = await prisma.payment.aggregate({
        _sum: { product_price_with_quantity: true },
        where: {
          status: 'SUCCESS',
          createdAt: { gte: prev_start, lte: prev_end },
        },
      });

      const prev_revenue =
        prevRevenueAggr._sum.product_price_with_quantity || 0;
      const current_revenue = total_sell;

      revenue_growth =
        prev_revenue === 0
          ? current_revenue > 0
            ? 100
            : 0 // Handle divide by zero
          : ((current_revenue - prev_revenue) / prev_revenue) * 100;
    }

    const result_ = await prisma.$queryRaw`
  SELECT 
    SUM(CAST(\`store_amount\` AS DECIMAL(20, 4))) AS totalStoreAmount,
    SUM(\`due_amount\`) AS totalDue,
    SUM(\`paid_amount\`) AS totalPaid,
    SUM(\`delevery_charge\`) AS totalDeliveryCharge,
    SUM(\`discount_amount\`) AS totalDiscount 
  FROM \`Payment\`
  WHERE \`status\` ="SUCCESS"
  AND \`createdAt\` >= ${startDateSql}   
  AND \`createdAt\` <= ${endDateSql};
`;

    const totals = result_[0];
    const totalStoreAmount = totals.totalStoreAmount ?? 0;
    const totalDue = totals.totalDue ?? 0;
    const totalPaid = totals.totalPaid ?? 0;
    const totalDeliveryCharge = totals.totalDeliveryCharge ?? 0;
    const totalDiscount = totals.totalDiscount ?? 0;
    // ================== 7. Response ==================

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
      daily_book_sales,
      weekly_book_sales,
      monthly_book_sales,
      daily_course_sales,
      weekly_course_sales,
      monthly_course_sales,
      top_books,
      top_courses,
      revenue_growth: revenue_growth.toFixed(2), // Format to 2 decimal places
      pending_book_orders,
      inactive_course_orders,
      withrawable: totalStoreAmount,
      totalPaid: totalPaid,
      totalDue: total_sell - totalPaid,
      totalDeliveryCharge,
      totalDiscount,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_finance_controller;
