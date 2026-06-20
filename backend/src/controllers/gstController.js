const { Voucher, VoucherEntry, VoucherInventory, Ledger, VoucherType } = require('../models');
const { Op } = require('sequelize');

exports.getGSTR1 = async (req, res) => {
  try {
    // Basic implementation for GSTR-1 (Outward Supplies / Sales)
    // Fetch all sales vouchers for a given date range
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = { date: { [Op.between]: [startDate, endDate] } };
    }

    // Find the Sales Voucher Type ID
    const salesType = await VoucherType.findOne({ where: { name: 'Sales' } });
    if (!salesType) return res.status(404).json({ message: 'Sales voucher type not found' });

    const salesVouchers = await Voucher.findAll({
      where: { 
        voucherTypeId: salesType.id,
        ...dateFilter
      },
      include: [
        { model: VoucherEntry, as: 'entries' },
        { model: VoucherInventory, as: 'inventoryEntries' }
      ]
    });

    let b2b = [];
    let b2c = [];
    let totalTaxable = 0;
    let totalTax = 0;

    // Process vouchers
    for (const v of salesVouchers) {
      // Decode party details
      let party = {};
      if (v.partyDetails) {
        try { party = JSON.parse(v.partyDetails); } catch(e){}
      }
      
      const isB2B = party.gstin && party.gstin.trim() !== '';
      
      const voucherData = {
        id: v.id,
        date: v.date,
        voucherNumber: v.voucherNumber,
        partyName: party.buyerName || party.supplierName || 'Cash',
        gstin: party.gstin || '',
        placeOfSupply: v.placeOfSupply || '',
        totalAmount: v.totalAmount,
        taxableValue: v.entries.reduce((sum, e) => sum + Number(e.taxableValue), 0),
        cgst: v.entries.reduce((sum, e) => sum + Number(e.cgst), 0),
        sgst: v.entries.reduce((sum, e) => sum + Number(e.sgst), 0),
        igst: v.entries.reduce((sum, e) => sum + Number(e.igst), 0),
        cess: v.entries.reduce((sum, e) => sum + Number(e.cess), 0),
      };

      if (isB2B) {
        b2b.push(voucherData);
      } else {
        b2c.push(voucherData);
      }

      totalTaxable += voucherData.taxableValue;
      totalTax += (voucherData.cgst + voucherData.sgst + voucherData.igst + voucherData.cess);
    }

    res.json({
      summary: { totalVouchers: salesVouchers.length, totalTaxable, totalTax },
      b2b,
      b2c,
      hsnSummary: [] // To be implemented by aggregating inventoryEntries
    });

  } catch (error) {
    console.error('GSTR1 error:', error);
    res.status(500).json({ message: 'Failed to generate GSTR-1', error: error.message });
  }
};

exports.getGSTR2 = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = { date: { [Op.between]: [startDate, endDate] } };
    }

    const purchaseType = await VoucherType.findOne({ where: { name: 'Purchase' } });
    if (!purchaseType) return res.status(404).json({ message: 'Purchase voucher type not found' });

    const purchaseVouchers = await Voucher.findAll({
      where: { 
        voucherTypeId: purchaseType.id,
        ...dateFilter
      },
      include: [
        { model: VoucherEntry, as: 'entries' },
        { model: VoucherInventory, as: 'inventoryEntries' }
      ]
    });

    let b2b = [];
    let b2bur = []; // Unregistered dealers
    let totalTaxable = 0;
    let totalTax = 0;

    for (const v of purchaseVouchers) {
      let party = {};
      if (v.partyDetails) {
        try { party = JSON.parse(v.partyDetails); } catch(e){}
      }
      
      const isRegistered = party.gstin && party.gstin.trim() !== '';
      
      const voucherData = {
        id: v.id,
        date: v.date,
        voucherNumber: v.voucherNumber,
        partyName: party.supplierName || 'Cash',
        gstin: party.gstin || '',
        totalAmount: v.totalAmount,
        taxableValue: v.entries.reduce((sum, e) => sum + Number(e.taxableValue), 0),
        cgst: v.entries.reduce((sum, e) => sum + Number(e.cgst), 0),
        sgst: v.entries.reduce((sum, e) => sum + Number(e.sgst), 0),
        igst: v.entries.reduce((sum, e) => sum + Number(e.igst), 0),
        cess: v.entries.reduce((sum, e) => sum + Number(e.cess), 0),
      };

      if (isRegistered) {
        b2b.push(voucherData);
      } else {
        b2bur.push(voucherData);
      }

      totalTaxable += voucherData.taxableValue;
      totalTax += (voucherData.cgst + voucherData.sgst + voucherData.igst + voucherData.cess);
    }

    res.json({
      summary: { totalVouchers: purchaseVouchers.length, totalTaxable, totalTax },
      b2b,
      b2bur
    });

  } catch (error) {
    console.error('GSTR2 error:', error);
    res.status(500).json({ message: 'Failed to generate GSTR-2', error: error.message });
  }
};

exports.getGSTR3B = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = { date: { [Op.between]: [startDate, endDate] } };
    }

    // Simplified GSTR-3B
    // Outward Supplies (Sales) - Tax Liability
    const salesType = await VoucherType.findOne({ where: { name: 'Sales' } });
    const salesVouchers = await Voucher.findAll({
      where: { voucherTypeId: salesType?.id, ...dateFilter },
      include: [{ model: VoucherEntry, as: 'entries' }]
    });

    let outwardTaxable = 0, outwardCGST = 0, outwardSGST = 0, outwardIGST = 0;
    salesVouchers.forEach(v => {
      v.entries.forEach(e => {
        outwardTaxable += Number(e.taxableValue || 0);
        outwardCGST += Number(e.cgst || 0);
        outwardSGST += Number(e.sgst || 0);
        outwardIGST += Number(e.igst || 0);
      });
    });

    // Inward Supplies (Purchases) - Eligible ITC
    const purchaseType = await VoucherType.findOne({ where: { name: 'Purchase' } });
    const purchaseVouchers = await Voucher.findAll({
      where: { voucherTypeId: purchaseType?.id, ...dateFilter },
      include: [{ model: VoucherEntry, as: 'entries' }]
    });

    // We can calculate ITC by looking at debit entries to Input Tax Ledgers
    let itcCGST = 0, itcSGST = 0, itcIGST = 0;
    
    // Alternative: calculate from items like Sales
    purchaseVouchers.forEach(v => {
      v.entries.forEach(e => {
         itcCGST += Number(e.cgst || 0);
         itcSGST += Number(e.sgst || 0);
         itcIGST += Number(e.igst || 0);
      });
    });

    res.json({
      outwardSupplies: {
        taxableValue: outwardTaxable,
        cgst: outwardCGST,
        sgst: outwardSGST,
        igst: outwardIGST
      },
      eligibleITC: {
        cgst: itcCGST,
        sgst: itcSGST,
        igst: itcIGST
      }
    });

  } catch (error) {
    console.error('GSTR3B error:', error);
    res.status(500).json({ message: 'Failed to generate GSTR-3B', error: error.message });
  }
};

exports.generateEwayBill = async (req, res) => {
  try {
    const { voucherId } = req.body;
    // Simulate API call to NIC
    // In reality, this would prepare JSON and push to NIC API with authentication
    
    const ewayBillNo = Math.floor(100000000000 + Math.random() * 900000000000).toString(); // 12 digit random
    
    if (voucherId) {
      await Voucher.update(
        { eWayBillNo: ewayBillNo, eWayBillDate: new Date() },
        { where: { id: voucherId } }
      );
    }

    res.json({ 
      success: true, 
      message: 'e-Way Bill generated successfully (Simulated)',
      ewayBillNo,
      ewayBillDate: new Date()
    });
  } catch (error) {
    console.error('e-Way Bill generation error:', error);
    res.status(500).json({ message: 'Failed to generate e-Way Bill', error: error.message });
  }
};

exports.generateEInvoice = async (req, res) => {
  try {
    const { voucherId } = req.body;
    // Simulate API call to IRP
    
    // 64-char hex IRN
    const chars = 'abcdef0123456789';
    let irn = '';
    for(let i=0; i<64; i++) irn += chars[Math.floor(Math.random() * 16)];
    
    const ackNo = Math.floor(100000000000000 + Math.random() * 900000000000000).toString(); // 15 digits
    
    if (voucherId) {
      await Voucher.update(
        { irn, ackNo, ackDate: new Date(), qrCode: 'simulated_qr_code_data_string' },
        { where: { id: voucherId } }
      );
    }

    res.json({ 
      success: true, 
      message: 'e-Invoice generated successfully (Simulated)',
      irn,
      ackNo,
      ackDate: new Date()
    });
  } catch (error) {
    console.error('e-Invoice generation error:', error);
    res.status(500).json({ message: 'Failed to generate e-Invoice', error: error.message });
  }
};
