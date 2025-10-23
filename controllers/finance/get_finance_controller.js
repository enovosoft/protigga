const prisma = require('../../config/db');
const responseGenerator = require('../../utils/responseGenerator');

const get_finance_controller = async (req, res, next) => {
  try {
    const start_date = req.query.start_date || '';
    const end_date = req.query.end_date || new Date();

    // ================== date filter
    let whereCondition = {};
    if (start_date && end_date) {
      whereCondition.createdAt = {
        gte: new Date(start_date),
        lte: new Date(end_date),
      };
    } else if (start_date) {
      whereCondition.createdAt = {
        gte: new Date(start_date),
      };
    } else if (end_date) {
      whereCondition.createdAt = {
        lte: new Date(end_date),
      };
    }

    // ================== fetch all successful payments
    const all_payment_data = await prisma.payment.findMany({
      where: { status: 'SUCCESS', ...whereCondition },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let total_book_sell_amount = 0;
    let total_course_sell_amount = 0;
    let total_orders_count = 0;
    let total_withdrawable_from_sslcomerz = 0;
    all_payment_data.forEach((payment) => {
      total_withdrawable_from_sslcomerz += Number(payment.store_amount);
    });

    all_payment_data.forEach((payment) => {
      if (payment.book_order_id) {
        total_book_sell_amount += payment.product_price_with_quantity;
        total_orders_count++;
      }
      if (payment.enrollment_id) {
        total_course_sell_amount += payment.product_price_with_quantity;
        total_orders_count++;
      }
    });

    const average_order_value =
      total_orders_count === 0
        ? 0
        : (total_book_sell_amount + total_course_sell_amount) /
          total_orders_count;

    // ================== fetch books & courses
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // ================== per book sales
    const book_sales = [];
    for (const book of books) {
      const orders = await prisma.book_order.findMany({
        where: {
          book_id: book.book_id,
          ...whereCondition,
          status: 'confirmed',
          payment: {
            status: 'SUCCESS',
          },
        },

        include: { payment: true },
      });
      const total_orders = orders.length;
      const total_amount = orders.reduce(
        (sum, order) => sum + (order.payment?.product_price_with_quantity || 0),
        0
      );
      book_sales.push({
        book_id: book.book_id,
        total_orders,
        total_amount,
        book_name: book.title,
      });
    }

    // ================== per course sales
    const course_sales = [];
    for (const course of courses) {
      const orders = await prisma.enrollment.findMany({
        where: {
          course_id: course.course_id,
          ...whereCondition,
          payment: {
            status: 'SUCCESS',
          },
        },

        include: { payment: true },
      });
      const total_orders = orders.length;
      const total_amount = orders.reduce(
        (sum, order) => sum + (order.payment?.product_price_with_quantity || 0),
        0
      );
      course_sales.push({
        course_id: course.course_id,
        total_orders,
        total_amount,
        course_name: course.course_title,
      });
    }

    // ================== daily/weekly/monthly sales with book/course names
    const book_orders = await prisma.book_order.findMany({
      where: { ...whereCondition, payment: { status: 'SUCCESS' } },
      include: { payment: true },
    });
    const course_orders = await prisma.enrollment.findMany({
      where: { ...whereCondition, payment: { status: 'SUCCESS' } },
      include: { payment: true },
    });

    const daily_book_sales = {};
    const weekly_book_sales = {};
    const monthly_book_sales = {};

    book_orders.forEach((order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      const week = `${order.createdAt.getFullYear()}-W${Math.ceil(
        (order.createdAt.getDate() + 6) / 7
      )}`;
      const month = `${order.createdAt.getFullYear()}-${
        order.createdAt.getMonth() + 1
      }`;
      const book_name =
        books.find((b) => b.book_id === order.book_id)?.title || 'Unknown';

      const addSale = (obj, key, name, amount) => {
        if (!obj[key]) obj[key] = {};
        if (!obj[key][name]) obj[key][name] = 0;
        obj[key][name] += amount;
      };

      const amount = order.payment?.product_price_with_quantity || 0;
      addSale(daily_book_sales, day, book_name, amount);
      addSale(weekly_book_sales, week, book_name, amount);
      addSale(monthly_book_sales, month, book_name, amount);
    });

    const daily_course_sales = {};
    const weekly_course_sales = {};
    const monthly_course_sales = {};

    course_orders.forEach((order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      const week = `${order.createdAt.getFullYear()}-W${Math.ceil(
        (order.createdAt.getDate() + 6) / 7
      )}`;
      const month = `${order.createdAt.getFullYear()}-${
        order.createdAt.getMonth() + 1
      }`;
      const course_name =
        courses.find((c) => c.course_id === order.course_id)?.course_title ||
        'Unknown';

      const addSale = (obj, key, name, amount) => {
        if (!obj[key]) obj[key] = {};
        if (!obj[key][name]) obj[key][name] = 0;
        obj[key][name] += amount;
      };

      const amount = order.payment?.product_price_with_quantity || 0;
      addSale(daily_course_sales, day, course_name, amount);
      addSale(weekly_course_sales, week, course_name, amount);
      addSale(monthly_course_sales, month, course_name, amount);
    });

    // ================== top selling books/courses
    const top_books = [...book_sales]
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10);
    const top_courses = [...course_sales]
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10);

    // ================== revenue growth
    let prev_revenue = 0;
    if (start_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      const diff = end - start;
      const prev_start = new Date(start.getTime() - diff);
      const prev_end = new Date(start.getTime() - 1);

      const prev_book_orders = await prisma.book_order.findMany({
        where: {
          createdAt: { gte: prev_start, lte: prev_end },
          payment: { status: 'SUCCESS' },
        },
        include: { payment: true },
      });
      const prev_book_total = prev_book_orders.reduce(
        (sum, order) => sum + (order.payment?.product_price_with_quantity || 0),
        0
      );

      const prev_course_orders = await prisma.enrollment.findMany({
        where: {
          createdAt: { gte: prev_start, lte: prev_end },
          payment: { status: 'SUCCESS' },
        },
        include: { payment: true },
      });
      const prev_course_total = prev_course_orders.reduce(
        (sum, order) => sum + (order.payment?.product_price_with_quantity || 0),
        0
      );

      prev_revenue = prev_book_total + prev_course_total;
    }

    const current_revenue = total_book_sell_amount + total_course_sell_amount;
    const revenue_growth =
      prev_revenue === 0
        ? 100
        : ((current_revenue - prev_revenue) / prev_revenue) * 100;

    // ================== pending/inactive orders
    const pending_book_orders = await prisma.book_order.count({
      where: { status: 'pending', ...whereCondition },
    });
    const inactive_course_orders = await prisma.enrollment.count({
      where: { status: 'inactive', ...whereCondition },
    });

    // ================== response
    return responseGenerator(200, res, {
      message: 'Finance data loaded',
      error: false,
      success: true,
      total_book_sell_amount,
      total_course_sell_amount,
      total_sell: total_book_sell_amount + total_course_sell_amount,
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
      revenue_growth,
      pending_book_orders,
      inactive_course_orders,
      withrawable: total_withdrawable_from_sslcomerz,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = get_finance_controller;
