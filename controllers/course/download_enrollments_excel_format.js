const ExcelJS = require('exceljs');
const prisma = require('../../config/db');

const download_enrollments_excel_format = async (req, res, next) => {
  try {
    const start_date = req.query.start_date || '';
    const end_date = req.query.end_date || new Date();
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

    const enrollments = await prisma.enrollment.findMany({
      where: {
        enrollment_status: 'success',
        ...whereCondition,
      },
      include: {
        payment: true,
        user: true,
        course: true,
      },
    });

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      `course_enrollment_${new Date(start_date).toDateString()}_to_${new Date(
        end_date
      ).toDateString()}`
    );

    // Add header row
    worksheet.columns = [
      { header: 'SN', key: 'sn', width: 10 },
      { header: 'Customer Name', key: 'customer_Name', width: 30 },
      { header: 'phone', key: 'phone', width: 40 },
      //  { header: 'address', key: 'address', width: 60 },
      { header: 'Txn_ID', key: 'Txn_ID', width: 30 },
      { header: 'product price', key: 'product_price', width: 30 },
      { header: 'quantity', key: 'quantity', width: 30 },
      { header: 'discount', key: 'discount_amount', width: 30 },
      { header: 'paid amount', key: 'paid_amount', width: 30 },
      { header: 'due amount', key: 'due_amount', width: 30 },
      { header: 'Order Date', key: 'order_date', width: 30 },
    ];

    // Sample data (you can replace this with database data)
    const enrollments_excel_data = [];

    enrollments.map((order, index) => {
      enrollments_excel_data.push({
        sn: index + 1,
        customer_Name: order.user.name,
        phone: order?.user?.phone,
        //  address: order.payment.add,
        Txn_ID: order.payment.Txn_ID,
        product_price: order.course.price,
        quantity: 1,
        discount_amount: order.payment.discount_amount,
        paid_amount: order.payment.paid_amount,
        due_amount: order.payment.due_amount,
        order_date: order.createdAt,
      });
    });

    // Add rows
    enrollments_excel_data.forEach((order) => worksheet.addRow(order));

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    let sheetName = '';

    if (start_date) {
      sheetName = `course enrollments from ${new Date(
        start_date
      ).toDateString()} to ${new Date(end_date).toDateString()}`;
    } else {
      sheetName = `course enrollments from published date to ${new Date(
        end_date
      ).toDateString()}`;
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${sheetName}.xlsx`
    );

    // Write workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return next(error);
  }
};
module.exports = download_enrollments_excel_format;
