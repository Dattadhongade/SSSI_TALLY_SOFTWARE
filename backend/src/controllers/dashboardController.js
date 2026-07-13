const { Voucher, VoucherType, EInvoice } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const salesType = await VoucherType.findOne({ where: { typeOfVoucher: 'Sales' } });
    
    let todaysSales = 0;
    let pendingGstr1 = 0;

    if (salesType) {
      // Today's Sales
      const sales = await Voucher.findAll({
        where: {
          voucherTypeId: salesType.id,
          date: { [Op.between]: [startOfDay, endOfDay] }
        }
      });
      todaysSales = sales.reduce((sum, v) => sum + Number(v.totalAmount), 0);

      // Pending E-Invoice / GSTR-1
      // For simplicity, we define "Pending GSTR-1" as Sales invoices missing E-Invoice if B2B
      const allSales = await Voucher.findAll({
        where: { voucherTypeId: salesType.id, invoiceType: 'B2B' },
        include: [{ model: EInvoice }]
      });

      pendingGstr1 = allSales.filter(v => !v.EInvoice || v.EInvoice.status !== 'Generated').length;
    }

    res.json({
      todaysSales,
      pendingGstr1
    });

  } catch (error) {
    console.error('Dashboard Data Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};
