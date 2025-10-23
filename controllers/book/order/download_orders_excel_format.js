const ExcelJS = require('exceljs');
const prisma = require('../../../config/db');

const download_orders_excel_format = async (req, res, next) => {
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

    const orders = await prisma.book_order.findMany({
      where: {
        status: 'confirmed',
        ...whereCondition,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        payment: true,
        book: true,
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      `book_orders_${new Date(start_date).toDateString()}_to_${new Date(
        end_date
      ).toDateString()}`
    );

    // Add header row
    worksheet.columns = [
      { header: 'SN', key: 'sn', width: 10 },
      { header: 'Customer Name', key: 'customer_Name', width: 30 },
      { header: 'phone', key: 'phone', width: 40 },
      { header: 'alternative phone', key: 'alternative_phone', width: 50 },
      { header: 'address', key: 'address', width: 60 },
      { header: 'Txn_ID', key: 'Txn_ID', width: 30 },
      { header: 'product price', key: 'product_price', width: 30 },
      { header: 'quantity', key: 'quantity', width: 30 },
      { header: 'discount', key: 'discount_amount', width: 30 },
      { header: 'paid amount', key: 'paid_amount', width: 30 },
      { header: 'due amount', key: 'due_amount', width: 30 },
      { header: 'Order Date', key: 'order_date', width: 30 },
    ];

    // Sample data (you can replace this with database data)
    const orders_excel_data = [];

    orders.map((order, index) => {
      orders_excel_data.push({
        sn: index + 1,
        customer_Name: order.user.name,
        phone: order.user.phone,
        alternative_phone: order.alternative_phone,
        address: order.address,
        Txn_ID: order.Txn_ID,
        product_price: order.product_price,
        quantity: order.quantity,
        discount_amount: order.payment.discount_amount,
        paid_amount: order.payment.paid_amount,
        due_amount: order.payment.due_amount,
        order_date: order.createdAt,
      });
    });

    // Add rows
    orders_excel_data.forEach((order) => worksheet.addRow(order));

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    let sheetName = '';

    if (start_date) {
      sheetName = `book orders from ${new Date(
        start_date
      ).toDateString()} to ${new Date(end_date).toDateString()}`;
    } else {
      sheetName = `book orders from published date to ${new Date(
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
module.exports = download_orders_excel_format;
