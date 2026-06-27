const { Voucher, VoucherEntry, VoucherInventory, VoucherType } = require('../models');
const { sequelize } = require('../config/database');

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
      placeOfSupply: req.body.placeOfSupply,
      isReverseCharge: req.body.isReverseCharge,
      dispatchDetails: req.body.dispatchDetails ? JSON.stringify(req.body.dispatchDetails) : null,
      partyDetails: req.body.partyDetails ? JSON.stringify(req.body.partyDetails) : null,
    }, { where: { id }, transaction: t });

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
