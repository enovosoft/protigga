// const prisma = require('../../config/db');
// const responseGenerator = require('../../utils/responseGenerator');

// const get_finance_controller = async (req, res, next) => {
//   try {
//     const start_date = req.query.start_date || '';
//     const end_date = req.query.end_date || new Date();

//     // ================== date filter
//     let whereCondition = {};
//     if (start_date && end_date) {
//       whereCondition.createdAt = {
//         gte: new Date(start_date),
//         lte: new Date(end_date),
//       };
//     } else if (start_date) {
//       whereCondition.createdAt = {
//         gte: new Date(start_date),
//       };
//     } else if (end_date) {
//       whereCondition.createdAt = {
//         lte: new Date(end_date),
//       };
//     }

//     // ================== fetch all successful payments
//     const all_payment_data = await prisma.payment.findMany({
//       where: { status: 'SUCCESS', ...whereCondition },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     let total_book_sell_amount = 0;
//     let total_course_sell_amount = 0;
//     let total_orders_count = 0;
//     let total_withdrawable_from_sslcomerz = 0;
//     all_payment_data.forEach((payment) => {
//       total_withdrawable_from_sslcomerz += Number(payment.store_amount);
//     });

//     all_payment_data.forEach((payment) => {
//       if (payment.book_order_id) {
//         total_book_sell_amount += payment.product_price_with_quantity;
//         total_orders_count++;
//       }
//       if (payment.enrollment_id) {
//         total_course_sell_amount += payment.product_price_with_quantity;
//         total_orders_count++;
//       }
//     });

//     const average_order_value =
//       total_orders_count === 0
//         ? 0
//         : (total_book_sell_amount + total_course_sell_amount) /
//           total_orders_count;

//     // ================== fetch books & courses
//     const books = await prisma.book.findMany({
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });
//     const courses = await prisma.course.findMany({
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     // ================== per book sales
//     const book_sales = [];
//     for (const book of books) {
//       const orders = await prisma.book_order.findMany({
//         where: {
//           book_id: book.book_id,
//           ...whereCondition,
//           status: 'confirmed',
//           payment: {
//             status: 'SUCCESS',
//           },
//         },

//         include: { payment: true },
//       });
//       const total_orders = orders.length;
//       const total_amount = orders.reduce(
//         (sum, order) => sum + (order.payment?.product_price_with_quantity || 0),
//         0
//       );
//       book_sales.push({
//         book_id: book.book_id,
//         total_orders,
//         total_amount,
//         book_name: book.title,
//       });
//     }

//     // ================== per course sales
//     const course_sales = [];
//     for (const course of courses) {
//       const orders = await prisma.enrollment.findMany({
//         where: {
//           course_id: course.course_id,
//           ...whereCondition,
//           payment: {
//             status: 'SUCCESS',
//           },
//         },

//         include: { payment: true },
//       });
//       const total_orders = orders.length;
//       const total_amount = orders.reduce(
//         (sum, order) => sum + (order.payment?.product_price_with_quantity || 0),
//         0
//       );
//       course_sales.push({
//         course_id: course.course_id,
//         total_orders,
//         total_amount,
//         course_name: course.course_title,
//       });
//     }

//     // ================== daily/weekly/monthly sales with book/course names
//     const book_orders = await prisma.book_order.findMany({
//       where: { ...whereCondition, payment: { status: 'SUCCESS' } },
//       include: { payment: true },
//     });
//     const course_orders = await prisma.enrollment.findMany({
//       where: { ...whereCondition, payment: { status: 'SUCCESS' } },
//       include: { payment: true },
//     });

//     const daily_book_sales = {};
//     const weekly_book_sales = {};
//     const monthly_book_sales = {};

//     book_orders.forEach((order) => {
//       const day = order.createdAt.toISOString().split('T')[0];
//       const week = `${order.createdAt.getFullYear()}-W${Math.ceil(
//         (order.createdAt.getDate() + 6) / 7
//       )}`;
//       const month = `${order.createdAt.getFullYear()}-${
//         order.createdAt.getMonth() + 1
//       }`;
//       const book_name =
//         books.find((b) => b.book_id === order.book_id)?.title || 'Unknown';

//       const addSale = (obj, key, name, amount) => {
//         if (!obj[key]) obj[key] = {};
//         if (!obj[key][name]) obj[key][name] = 0;
//         obj[key][name] += amount;
//       };

//       const amount = order.payment?.product_price_with_quantity || 0;
//       addSale(daily_book_sales, day, book_name, amount);
//       addSale(weekly_book_sales, week, book_name, amount);
//       addSale(monthly_book_sales, month, book_name, amount);
//     });

//     const daily_course_sales = {};
//     const weekly_course_sales = {};
//     const monthly_course_sales = {};

//     course_orders.forEach((order) => {
//       const day = order.createdAt.toISOString().split('T')[0];
//       const week = `${order.createdAt.getFullYear()}-W${Math.ceil(
//         (order.createdAt.getDate() + 6) / 7
//       )}`;
//       const month = `${order.createdAt.getFullYear()}-${
//         order.createdAt.getMonth() + 1
//       }`;
//       const course_name =
//         courses.find((c) => c.course_id === order.course_id)?.course_title ||
//         'Unknown';

//       const addSale = (obj, key, name, amount) => {
//         if (!obj[key]) obj[key] = {};
//         if (!obj[key][name]) obj[key][name] = 0;
//         obj[key][name] += amount;
//       };

//       const amount = order.payment?.product_price_with_quantity || 0;
//       addSale(daily_course_sales, day, course_name, amount);
//       addSale(weekly_course_sales, week, course_name, amount);
//       addSale(monthly_course_sales, month, course_name, amount);
//     });

//     // ================== top selling books/courses
//     const top_books = [...book_sales]
//       .sort((a, b) => b.total_amount - a.total_amount)
//       .slice(0, 10);
//     const top_courses = [...course_sales]
//       .sort((a, b) => b.total_amount - a.total_amount)
//       .slice(0, 10);

//     // ================== revenue growth
//     let prev_revenue = 0;
//     if (start_date) {
//       const start = new Date(start_date);
//       const end = new Date(end_date);
//       const diff = end - start;
//       const prev_start = new Date(start.getTime() - diff);
//       const prev_end = new Date(start.getTime() - 1);

//       const prev_book_orders = await prisma.book_order.findMany({
//         where: {
//           createdAt: { gte: prev_start, lte: prev_end },
//           payment: { status: 'SUCCESS' },
//         },
//         include: { payment: true },
//       });
//       const prev_book_total = prev_book_orders.reduce(
//         (sum, order) => sum + (order.payment?.product_price_with_quantity || 0),
//         0
//       );

//       const prev_course_orders = await prisma.enrollment.findMany({
//         where: {
//           createdAt: { gte: prev_start, lte: prev_end },
//           payment: { status: 'SUCCESS' },
//         },
//         include: { payment: true },
//       });
//       const prev_course_total = prev_course_orders.reduce(
//         (sum, order) => sum + (order.payment?.product_price_with_quantity || 0),
//         0
//       );

//       prev_revenue = prev_book_total + prev_course_total;
//     }

//     const current_revenue = total_book_sell_amount + total_course_sell_amount;
//     const revenue_growth =
//       prev_revenue === 0
//         ? 100
//         : ((current_revenue - prev_revenue) / prev_revenue) * 100;

//     // ================== pending/inactive orders
//     const pending_book_orders = await prisma.book_order.count({
//       where: { status: 'pending', ...whereCondition },
//     });
//     const inactive_course_orders = await prisma.enrollment.count({
//       where: { status: 'inactive', ...whereCondition },
//     });

//     // ================== response
//     return responseGenerator(200, res, {
//       message: 'Finance data loaded',
//       error: false,
//       success: true,
//       total_book_sell_amount,
//       total_course_sell_amount,
//       total_sell: total_book_sell_amount + total_course_sell_amount,
//       average_order_value,
//       book_sales,
//       course_sales,
//       daily_book_sales,
//       weekly_book_sales,
//       monthly_book_sales,
//       daily_course_sales,
//       weekly_course_sales,
//       monthly_course_sales,
//       top_books,
//       top_courses,
//       revenue_growth,
//       pending_book_orders,
//       inactive_course_orders,
//       withrawable: total_withdrawable_from_sslcomerz,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// module.exports = get_finance_controller;

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

    // ================== 3. Per-Book & Per-Course Sales (Replaces N+1) ==================
    // This is the efficient way to replace your N+1 loop.
    // We group on the Payment table, then map details.

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
    // We must use Raw SQL (`$queryRaw`) for this.
    // Grouping by date parts in JS (like you did) will OOM crash your server.

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
      // Note: The raw query results need formatting in your frontend
      // For example, they are arrays like [{ day: '2025-10-10', name: 'Book A', total: 100 }]
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
    });
  } catch (error) {
    // return next();
  }
};

module.exports = get_finance_controller;
