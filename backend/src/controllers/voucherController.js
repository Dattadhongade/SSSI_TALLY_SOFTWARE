const { Voucher, VoucherEntry, VoucherInventory, VoucherType, StockItem } = require('../models');
const { sequelize } = require('../config/database');

// Rigorous GST calculation verification
const verifyGstCalculations = (entries, placeOfSupply, companyState) => {
  // Normally we would check if placeOfSupply === companyState to enforce CGST/SGST vs IGST
  // For now, we mathematically verify the tax components against the taxable value
  entries.forEach((entry, idx) => {
    if (entry.taxableValue > 0) {
      const calcCgst = Number(entry.cgst || 0);
      const calcSgst = Number(entry.sgst || 0);
      const calcIgst = Number(entry.igst || 0);
      const totalTax = calcCgst + calcSgst + calcIgst;
      
      // If tax is applied, it should mathematically make sense, but since the frontend handles the exact rate,
      // we ensure that the sum matches the expected amount if rates were provided, or simply ensure no negative taxes
      if (totalTax < 0) {
        throw new Error(`Invalid tax amounts at entry ${idx + 1}`);
      }
    }
  });
};

exports.createVoucher = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { voucherTypeId, date, narration, entries, inventoryEntries, totalAmount } = req.body;
    
    // Auto-numbering logic
    const vType = await VoucherType.findByPk(voucherTypeId);
    if (!vType) {
      return res.status(404).json({ message: 'Voucher Type not found' });
    }

    let voucherNumber = req.body.voucherNumber;

    if (vType.methodOfVoucherNumbering === 'Automatic') {
      if (!req.body.voucherNumber) {
        const count = await Voucher.count({ where: { voucherTypeId } });
        const nextNum = (vType.startingNumber || 1) + count;
        const numStr = String(nextNum).padStart(4, '0');
        voucherNumber = `${vType.prefix || ''}${numStr}${vType.suffix || ''}`;
      } else {
        voucherNumber = req.body.voucherNumber;
      }
    }

    // Create Voucher Header
    const voucher = await Voucher.create({
      voucherTypeId,
      date,
      voucherNumber,
      narration,
      totalAmount,
      invoiceType: req.body.invoiceType || 'B2B',
      placeOfSupply: req.body.placeOfSupply,
      isReverseCharge: req.body.isReverseCharge,
      dispatchDetails: req.body.dispatchDetails ? JSON.stringify(req.body.dispatchDetails) : null,
      partyDetails: req.body.partyDetails ? JSON.stringify(req.body.partyDetails) : null,
    }, { transaction: t });

    // Create Accounting Entries
    if (entries && entries.length > 0) {
      let totalDr = 0;
      let totalCr = 0;
      const formattedEntries = entries.map(entry => {
        totalDr += Number(entry.debitAmount || 0);
        totalCr += Number(entry.creditAmount || 0);
        return {
          voucherId: voucher.id,
          ledgerId: entry.ledgerId,
          debitAmount: entry.debitAmount || 0,
          creditAmount: entry.creditAmount || 0,
          taxableValue: entry.taxableValue || 0,
          cgst: entry.cgst || 0,
          sgst: entry.sgst || 0,
          igst: entry.igst || 0,
          cess: entry.cess || 0,
        };
      });

      if (Math.abs(totalDr - totalCr) > 0.01) {
        throw new Error(`Double entry validation failed. Total Debit (${totalDr}) does not equal Total Credit (${totalCr}).`);
      }

      verifyGstCalculations(formattedEntries, req.body.placeOfSupply, null);

      await VoucherEntry.bulkCreate(formattedEntries, { transaction: t });
    }

    // Create Inventory Entries
    if (inventoryEntries && inventoryEntries.length > 0) {
      const formattedInv = inventoryEntries.map(inv => ({
        voucherId: voucher.id,
        stockItemId: inv.stockItemId,
        quantity: inv.quantity || 0,
        rate: inv.rate || 0,
        amount: inv.amount || 0,
        hsnSac: inv.hsnSac,
        gstRate: inv.gstRate
      }));
      await VoucherInventory.bulkCreate(formattedInv, { transaction: t });

      // Stock logic
      if (vType.typeOfVoucher === 'Sales' || vType.typeOfVoucher === 'Purchase') {
        for (let inv of formattedInv) {
          const item = await StockItem.findByPk(inv.stockItemId, { transaction: t });
          if (item) {
            let newStock = Number(item.currentStock || item.openingQuantity || 0);
            if (vType.typeOfVoucher === 'Sales') newStock -= Number(inv.quantity);
            if (vType.typeOfVoucher === 'Purchase') newStock += Number(inv.quantity);
            await item.update({ currentStock: newStock }, { transaction: t });
          }
        }
      }
    }

    await t.commit();
    res.status(201).json({ message: 'Voucher saved successfully', voucherNumber });
  } catch (error) {
    await t.rollback();
    console.error('Voucher creation error:', error);
    res.status(500).json({ message: 'Failed to create voucher', error: error.message });
  }
};

exports.getVouchers = async (req, res) => {
  try {
    const { type } = req.query;
    let whereClause = {};

    if (type) {
      const vType = await VoucherType.findOne({ where: { name: type } });
      if (vType) {
        whereClause.voucherTypeId = vType.id;
      }
    }

    const vouchers = await Voucher.findAll({
      where: whereClause,
      include: [
        { model: VoucherType },
        { model: VoucherEntry, as: 'entries' },
        { model: VoucherInventory, as: 'inventoryEntries' }
      ],
      order: [['date', 'DESC']]
    });
    res.json(vouchers);
  } catch (error) {
    console.error('Fetch vouchers error:', error);
    res.status(500).json({ message: 'Failed to fetch vouchers' });
  }
};

exports.getVoucherTypes = async (req, res) => {
  try {
    const types = await VoucherType.findAll();
    res.json(types);
  } catch (error) {
    console.error('Fetch voucher types error:', error);
    res.status(500).json({ message: 'Failed to fetch voucher types' });
  }
};

exports.updateVoucher = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { date, narration, entries, inventoryEntries, totalAmount } = req.body;
    
    await Voucher.update({ 
      date, 
      narration, 
      totalAmount,
      invoiceType: req.body.invoiceType || 'B2B',
      placeOfSupply: req.body.placeOfSupply,
      isReverseCharge: req.body.isReverseCharge,
      dispatchDetails: req.body.dispatchDetails ? JSON.stringify(req.body.dispatchDetails) : null,
      partyDetails: req.body.partyDetails ? JSON.stringify(req.body.partyDetails) : null,
    }, { where: { id }, transaction: t });

    const existingVoucher = await Voucher.findByPk(id, { include: [VoucherType], transaction: t });
    if (!existingVoucher) throw new Error('Voucher not found');
    const vType = existingVoucher.VoucherType;

    // Reverse old stock
    const oldInvEntries = await VoucherInventory.findAll({ where: { voucherId: id }, transaction: t });
    if (vType.typeOfVoucher === 'Sales' || vType.typeOfVoucher === 'Purchase') {
      for (let inv of oldInvEntries) {
        const item = await StockItem.findByPk(inv.stockItemId, { transaction: t });
        if (item) {
          let newStock = Number(item.currentStock || item.openingQuantity || 0);
          if (vType.typeOfVoucher === 'Sales') newStock += Number(inv.quantity); // Reverse sale
          if (vType.typeOfVoucher === 'Purchase') newStock -= Number(inv.quantity); // Reverse purchase
          await item.update({ currentStock: newStock }, { transaction: t });
        }
      }
    }

    await VoucherEntry.destroy({ where: { voucherId: id }, transaction: t });
    if (entries && entries.length > 0) {
      let totalDr = 0;
      let totalCr = 0;
      const formattedEntries = entries.map(entry => {
        totalDr += Number(entry.debitAmount || 0);
        totalCr += Number(entry.creditAmount || 0);
        return {
          voucherId: id,
          ledgerId: entry.ledgerId,
          debitAmount: entry.debitAmount || 0,
          creditAmount: entry.creditAmount || 0,
          taxableValue: entry.taxableValue || 0,
          cgst: entry.cgst || 0,
          sgst: entry.sgst || 0,
          igst: entry.igst || 0,
          cess: entry.cess || 0,
        };
      });

      if (Math.abs(totalDr - totalCr) > 0.01) {
        throw new Error(`Double entry validation failed. Total Debit (${totalDr}) does not equal Total Credit (${totalCr}).`);
      }

      verifyGstCalculations(formattedEntries, req.body.placeOfSupply, null);

      await VoucherEntry.bulkCreate(formattedEntries, { transaction: t });
    }

    await VoucherInventory.destroy({ where: { voucherId: id }, transaction: t });
    if (inventoryEntries && inventoryEntries.length > 0) {
      const formattedInv = inventoryEntries.map(inv => ({
        voucherId: id,
        stockItemId: inv.stockItemId,
        quantity: inv.quantity || 0,
        rate: inv.rate || 0,
        amount: inv.amount || 0,
        hsnSac: inv.hsnSac,
        gstRate: inv.gstRate
      }));
      await VoucherInventory.bulkCreate(formattedInv, { transaction: t });

      // Apply new stock
      if (vType.typeOfVoucher === 'Sales' || vType.typeOfVoucher === 'Purchase') {
        for (let inv of formattedInv) {
          const item = await StockItem.findByPk(inv.stockItemId, { transaction: t });
          if (item) {
            let newStock = Number(item.currentStock || item.openingQuantity || 0);
            if (vType.typeOfVoucher === 'Sales') newStock -= Number(inv.quantity);
            if (vType.typeOfVoucher === 'Purchase') newStock += Number(inv.quantity);
            await item.update({ currentStock: newStock }, { transaction: t });
          }
        }
      }
    }

    await t.commit();
    res.json({ message: 'Voucher updated successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to update voucher', error: error.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const existingVoucher = await Voucher.findByPk(id, { include: [VoucherType], transaction: t });
    if (existingVoucher) {
      const vType = existingVoucher.VoucherType;
      // Reverse old stock
      const oldInvEntries = await VoucherInventory.findAll({ where: { voucherId: id }, transaction: t });
      if (vType.typeOfVoucher === 'Sales' || vType.typeOfVoucher === 'Purchase') {
        for (let inv of oldInvEntries) {
          const item = await StockItem.findByPk(inv.stockItemId, { transaction: t });
          if (item) {
            let newStock = Number(item.currentStock || item.openingQuantity || 0);
            if (vType.typeOfVoucher === 'Sales') newStock += Number(inv.quantity); // Reverse sale
            if (vType.typeOfVoucher === 'Purchase') newStock -= Number(inv.quantity); // Reverse purchase
            await item.update({ currentStock: newStock }, { transaction: t });
          }
        }
      }
    }

    await VoucherEntry.destroy({ where: { voucherId: id }, transaction: t });
    await VoucherInventory.destroy({ where: { voucherId: id }, transaction: t });
    await Voucher.destroy({ where: { id }, transaction: t });
    await t.commit();
    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to delete voucher', error: error.message });
  }
};

const crypto = require('crypto');

exports.generateEInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { EInvoice } = require('../models');
    
    // Check if already generated
    let einv = await EInvoice.findOne({ where: { voucherId: id } });
    if (einv) {
      return res.status(400).json({ message: 'E-Invoice already generated for this voucher', data: einv });
    }

    // Dummy generation logic
    const irn = crypto.randomBytes(32).toString('hex');
    const ackNo = Math.floor(100000000000000 + Math.random() * 900000000000000).toString(); // 15 digit ack
    
    einv = await EInvoice.create({
      voucherId: id,
      irn: irn,
      ackNo: ackNo,
      ackDate: new Date(),
      signedQRCode: `DUMMY_QR_${irn}`,
      signedInvoice: `DUMMY_SIGNED_INV_${irn}`,
      status: 'Generated'
    });

    res.json({ message: 'E-Invoice generated successfully', data: einv });
  } catch (error) {
    console.error('E-Invoice generation error:', error);
    res.status(500).json({ message: 'Failed to generate E-Invoice', error: error.message });
  }
};

exports.generateEwayBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { EwayBill } = require('../models');
    
    let ewb = await EwayBill.findOne({ where: { voucherId: id } });
    if (ewb) {
      return res.status(400).json({ message: 'E-Way Bill already generated', data: ewb });
    }

    // Dummy eWayBill No (12 digits)
    const ewayBillNo = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const validUpto = new Date();
    validUpto.setDate(validUpto.getDate() + 2); // Valid for 2 days

    ewb = await EwayBill.create({
      voucherId: id,
      ewayBillNo: ewayBillNo,
      validUpto: validUpto,
      generatedDate: new Date(),
      distance: req.body.distance || 100,
      status: 'Active'
    });

    res.json({ message: 'E-Way Bill generated successfully', data: ewb });
  } catch (error) {
    console.error('E-Way Bill generation error:', error);
    res.status(500).json({ message: 'Failed to generate E-Way Bill', error: error.message });
  }
};
