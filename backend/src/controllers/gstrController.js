const { Voucher, VoucherEntry, Ledger, VoucherType } = require('../models');
const { Op } = require('sequelize');

exports.getGSTR1 = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    
    // Default to current month if dates not provided
    const today = new Date();
    const start = fromDate ? new Date(fromDate) : new Date(today.getFullYear(), today.getMonth(), 1);
    const end = toDate ? new Date(toDate) : new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const salesType = await VoucherType.findOne({ where: { typeOfVoucher: 'Sales' } });

    if (!salesType) {
      return res.json({ b2b: [], b2c: [], export: [] });
    }

    const vouchers = await Voucher.findAll({
      where: {
        voucherTypeId: salesType.id,
        date: { [Op.between]: [start, end] }
      },
      include: [
        { model: VoucherEntry, as: 'entries', include: [{ model: Ledger }] }
      ]
    });

    const b2b = [];
    const b2c = [];
    const exportsList = [];

    vouchers.forEach(v => {
      // Basic grouping based on invoiceType
      const invType = v.invoiceType || 'B2B';
      
      const reportData = {
        invoiceNumber: v.voucherNumber,
        date: v.date,
        totalAmount: v.totalAmount,
        placeOfSupply: v.placeOfSupply
      };

      if (invType === 'B2B') {
        // Find party details from first entry
        const partyEntry = v.entries.find(e => e.debitAmount > 0);
        reportData.gstin = partyEntry?.Ledger?.gstin || '';
        reportData.partyName = partyEntry?.Ledger?.name || '';
        b2b.push(reportData);
      } else if (invType === 'B2C' || invType === 'Regular') {
        b2c.push(reportData);
      } else if (invType === 'Export') {
        exportsList.push(reportData);
      }
    });

    res.json({
      summary: {
        totalB2B: b2b.length,
        totalB2C: b2c.length,
        totalExport: exportsList.length,
        totalInvoices: vouchers.length
      },
      b2b,
      b2c,
      exports: exportsList
    });

  } catch (error) {
    console.error('GSTR1 Error:', error);
    res.status(500).json({ message: 'Failed to generate GSTR1 report' });
  }
};
