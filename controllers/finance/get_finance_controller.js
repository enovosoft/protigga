const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_finance_controller = async (req, res, next) => {
  try {
    // ================== Date Filter ==================
    const { start_date, end_date } = req.query;

    const whereCreatedAt = {};
    if (start_date) {
      whereCreatedAt.gte = new Date(start_date);
    }
    if (end_date) {
      const endDateObj = new Date(end_date);
      endDateObj.setHours(23, 59, 59, 999);
      whereCreatedAt.lte = endDateObj;
    } else {
      whereCreatedAt.lte = new Date();
    }

    // Common WHERE clause
    const paymentWhere = {
      status: 'SUCCESS',
      createdAt: whereCreatedAt,
    };

    // Date filters for Raw Queries (Prisma needs explicit Dates or Strings for raw)
    const startDateSql = whereCreatedAt.gte || new Date('2000-01-01');
    const endDateSql = whereCreatedAt.lte || new Date();

    // ================== 1. Main Aggregations (DB does the math) ==================
    const [
      bookSalesAggr,
      courseSalesAggr,
      totalOrdersCount,
      pending_book_orders,
      inactive_course_orders,
      rawTotals,
    ] = await Promise.all([
      // A. Total Book Sales Amount (Direct Sum, No GroupBy)
      prisma.payment.aggregate({
        _sum: { product_price_with_quantity: true },
        where: { ...paymentWhere, book_order_id: { not: null } },
      }),

      // B. Total Course Sales Amount (Direct Sum)
      prisma.payment.aggregate({
        _sum: { product_price_with_quantity: true },
        where: { ...paymentWhere, enrollment_id: { not: null } },
      }),

      // C. Total Orders Count
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

      prisma.$queryRaw`
        SELECT 
          SUM(paid_amount) as "totalPaid",
          SUM(due_amount) as "totalDue",
          SUM(CAST(NULLIF(store_amount, '') AS DECIMAL)) as "totalWithdrawable"
        FROM "Payment"
        WHERE status = 'SUCCESS' 
          AND "createdAt" >= ${startDateSql} 
          AND "createdAt" <= ${endDateSql}
      `,
    ]);

    // Extract Values
    const total_book_sell_amount =
      bookSalesAggr._sum.product_price_with_quantity || 0;
    const total_course_sell_amount =
      courseSalesAggr._sum.product_price_with_quantity || 0;
    const total_sell = total_book_sell_amount + total_course_sell_amount;
    const average_order_value =
      totalOrdersCount === 0 ? 0 : total_sell / totalOrdersCount;

    // Extract Raw Totals
    const financeTotals = rawTotals[0] || {};
    const totalPaid = financeTotals.totalPaid || 0;
    const totalWithdrawable = financeTotals.totalWithdrawable || 0;

    const totalDue = financeTotals.totalDue || 0;
    const [book_sales, course_sales] = await Promise.all([
      // Group by Book via Join
      prisma.$queryRaw`
        SELECT 
          b.book_id, b.title as book_name,
          COUNT(p.id)::int as total_orders,
          SUM(p.product_price_with_quantity) as total_amount
        FROM "Payment" p
        JOIN "Book_order" bo ON p.book_order_id = bo.order_id
        JOIN "Book" b ON bo.book_id = b.book_id
        WHERE p.status = 'SUCCESS' AND p."createdAt" >= ${startDateSql} AND p."createdAt" <= ${endDateSql}
        GROUP BY b.book_id, b.title
        ORDER BY total_amount DESC
      `,

      // Group by Course via Join
      prisma.$queryRaw`
        SELECT 
          c.course_id, c.course_title as course_name,
          COUNT(p.id)::int as total_orders,
          SUM(p.product_price_with_quantity) as total_amount
        FROM "Payment" p
        JOIN "Enrollment" e ON p.enrollment_id = e.enrollment_id
        JOIN "Course" c ON e.course_id = c.course_id
        WHERE p.status = 'SUCCESS' AND p."createdAt" >= ${startDateSql} AND p."createdAt" <= ${endDateSql}
        GROUP BY c.course_id, c.course_title
        ORDER BY total_amount DESC
      `,
    ]);

    // ================== 3. Graphs (Daily/Weekly/Monthly) ==================
    // আপনার আগের লজিক ঠিক আছে, শুধু টাইপ সেফটির জন্য COALESCE ব্যবহার করা ভালো।

    const [
      daily_book_sales,
      weekly_book_sales,
      monthly_book_sales,
      daily_course_sales,
      weekly_course_sales,
      monthly_course_sales,
    ] = await Promise.all([
      // ... আপনার আগের গ্রাফ কুয়েরিগুলো এখানে ঠিক আছে ...
      // শুধু উদাহরণ হিসেবে একটা দেখালাম:
      prisma.$queryRaw`
        SELECT TO_CHAR(p."createdAt", 'YYYY-MM-DD') as day, b.title as name, CAST(SUM(p.product_price_with_quantity) AS INTEGER) as total
        FROM "Payment" p
        JOIN "Book_order" bo ON p.book_order_id = bo.order_id
        JOIN "Book" b ON bo.book_id = b.book_id
        WHERE p.status = 'SUCCESS' AND p."createdAt" >= ${startDateSql} AND p."createdAt" <= ${endDateSql}
        GROUP BY day, name ORDER BY day`,

      // ... বাকিগুলো আপনার কোড অনুযায়ী ...
      prisma.$queryRaw`SELECT TO_CHAR(p."createdAt", 'YYYY-IW') as week, b.title as name, CAST(SUM(p.product_price_with_quantity) AS INTEGER) as total FROM "Payment" p JOIN "Book_order" bo ON p.book_order_id = bo.order_id JOIN "Book" b ON bo.book_id = b.book_id WHERE p.status = 'SUCCESS' AND p."createdAt" >= ${startDateSql} AND p."createdAt" <= ${endDateSql} GROUP BY week, name ORDER BY week`,
      prisma.$queryRaw`SELECT TO_CHAR(p."createdAt", 'YYYY-MM') as month, b.title as name, CAST(SUM(p.product_price_with_quantity) AS INTEGER) as total FROM "Payment" p JOIN "Book_order" bo ON p.book_order_id = bo.order_id JOIN "Book" b ON bo.book_id = b.book_id WHERE p.status = 'SUCCESS' AND p."createdAt" >= ${startDateSql} AND p."createdAt" <= ${endDateSql} GROUP BY month, name ORDER BY month`,
      prisma.$queryRaw`SELECT TO_CHAR(p."createdAt", 'YYYY-MM-DD') as day, c.course_title as name, CAST(SUM(p.product_price_with_quantity) AS INTEGER) as total FROM "Payment" p JOIN "Enrollment" e ON p.enrollment_id = e.enrollment_id JOIN "Course" c ON e.course_id = c.course_id WHERE p.status = 'SUCCESS' AND p."createdAt" >= ${startDateSql} AND p."createdAt" <= ${endDateSql} GROUP BY day, name ORDER BY day`,
      prisma.$queryRaw`SELECT TO_CHAR(p."createdAt", 'YYYY-IW') as week, c.course_title as name, CAST(SUM(p.product_price_with_quantity) AS INTEGER) as total FROM "Payment" p JOIN "Enrollment" e ON p.enrollment_id = e.enrollment_id JOIN "Course" c ON e.course_id = c.course_id WHERE p.status = 'SUCCESS' AND p."createdAt" >= ${startDateSql} AND p."createdAt" <= ${endDateSql} GROUP BY week, name ORDER BY week`,
      prisma.$queryRaw`SELECT TO_CHAR(p."createdAt", 'YYYY-MM') as month, c.course_title as name, CAST(SUM(p.product_price_with_quantity) AS INTEGER) as total FROM "Payment" p JOIN "Enrollment" e ON p.enrollment_id = e.enrollment_id JOIN "Course" c ON e.course_id = c.course_id WHERE p.status = 'SUCCESS' AND p."createdAt" >= ${startDateSql} AND p."createdAt" <= ${endDateSql} GROUP BY month, name ORDER BY month`,
    ]);

    // ================== 4. Top Selling & Growth ==================
    const top_books = book_sales.slice(0, 10);
    const top_courses = course_sales.slice(0, 10);

    // Revenue Growth Logic (kept same as yours, just ensure safe math)
    let revenue_growth = 0;
    if (start_date && end_date) {
      // ... আপনার গ্রোথ ক্যালকুলেশন লজিক ঠিক আছে ...
      // শুধু মনে রাখবেন prevRevenueAggr এর জন্যও লুপ ব্যবহার করবেন না, _sum ব্যবহার করবেন।
      const start = new Date(start_date);
      const end = new Date(end_date);
      const diff = end.getTime() - start.getTime();
      const prev_start = new Date(start.getTime() - diff - 1);
      const prev_end = new Date(start.getTime() - 1);

      const prevRevenueAggr = await prisma.payment.aggregate({
        _sum: { product_price_with_quantity: true },
        where: {
          status: 'SUCCESS',
          createdAt: { gte: prev_start, lte: prev_end },
        },
      });
      const prev_revenue =
        prevRevenueAggr._sum.product_price_with_quantity || 0;
      revenue_growth =
        prev_revenue === 0
          ? total_sell > 0
            ? 100
            : 0
          : ((total_sell - prev_revenue) / prev_revenue) * 100;
    }

    // ================== Response ==================
    return responseGenerator(200, res, {
      message: 'Finance data loaded',
      error: false,
      success: true,

      // Totals
      total_book_sell_amount,
      total_course_sell_amount,
      total_sell,
      average_order_value,

      // Payment Breakdown
      totalPaid,
      totalDue: total_sell - totalPaid >= 0 ? total_sell - totalPaid : 0,
      withrawable: totalWithdrawable,

      // Lists & Graphs
      book_sales, // This now comes directly from Raw Query (fast)
      course_sales,
      top_books,
      top_courses,

      daily_book_sales,
      weekly_book_sales,
      monthly_book_sales,
      daily_course_sales,
      weekly_course_sales,
      monthly_course_sales,

      // Meta
      revenue_growth: revenue_growth.toFixed(2),
      pending_book_orders,
      inactive_course_orders,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

module.exports = get_finance_controller;
