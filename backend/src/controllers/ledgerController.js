const { Ledger } = require('../models');

const sanitizeData = (data) => {
  const sanitized = { ...data };
  if (sanitized.groupId === '') sanitized.groupId = null;
  if (sanitized.openingBalance === '') sanitized.openingBalance = 0;
  if (sanitized.creditPeriod === '') sanitized.creditPeriod = 0;
  if (sanitized.creditLimit === '') sanitized.creditLimit = 0;
  sanitized.interestCalculation = !!sanitized.interestCalculation;
  sanitized.costCenterApplicable = !!sanitized.costCenterApplicable;
  return sanitized;
};

exports.createLedger = async (req, res) => {
  try {
    const data = sanitizeData(req.body);
    const ledger = await Ledger.create(data);
    res.status(201).json({ message: 'Ledger created successfully', ledger });
  } catch (error) {
    console.error('Create ledger error:', error);
    res.status(500).json({ message: 'Failed to create ledger', error: error.message });
  }
};

exports.getLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.findAll();
    res.json(ledgers);
  } catch (error) {
    console.error('Fetch ledgers error:', error);
    res.status(500).json({ message: 'Failed to fetch ledgers' });
  }
};

exports.getLedgerById = async (req, res) => {
  try {
    const ledger = await Ledger.findByPk(req.params.id);
    if (!ledger) return res.status(404).json({ message: 'Ledger not found' });
    res.json(ledger);
  } catch (error) {
    console.error('Fetch ledger error:', error);
    res.status(500).json({ message: 'Failed to fetch ledger' });
  }
};

exports.updateLedger = async (req, res) => {
  try {
    const data = sanitizeData(req.body);
    const ledger = await Ledger.findByPk(req.params.id);
    if (!ledger) return res.status(404).json({ message: 'Ledger not found' });
    
    await ledger.update(data);
    res.json({ message: 'Ledger updated successfully', ledger });
  } catch (error) {
    console.error('Update ledger error:', error);
    res.status(500).json({ message: 'Failed to update ledger', error: error.message });
  }
};

exports.deleteLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findByPk(req.params.id);
    if (!ledger) return res.status(404).json({ message: 'Ledger not found' });
    
    await ledger.destroy();
    res.json({ message: 'Ledger deleted successfully' });
  } catch (error) {
    console.error('Delete ledger error:', error);
    res.status(500).json({ message: 'Failed to delete ledger', error: error.message });
  }
};
