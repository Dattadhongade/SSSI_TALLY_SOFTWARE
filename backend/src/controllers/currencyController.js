const { Currency } = require('../models');

exports.createCurrency = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] || req.body.companyId || null;
    const financialYearId = req.headers['x-financial-year-id'] || req.body.financialYearId || null;
    const userId = req.user?.id || null;

    const payload = { ...req.body, companyId, financialYearId, userId };

    // Update existing
    if (req.params.id) {
      const currency = await Currency.findByPk(req.params.id);
      if (currency) {
        await currency.update(payload);
        return res.json(currency);
      }
      return res.status(404).json({ message: 'Currency not found' });
    }

    const currency = await Currency.create(payload);
    res.status(201).json(currency);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save currency', error: error.message });
  }
};

exports.getCurrencies = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] || null;
    const where = companyId ? { companyId } : {};
    const currencies = await Currency.findAll({ where });
    res.json(currencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrencyById = async (req, res) => {
  try {
    const currency = await Currency.findByPk(req.params.id);
    if (!currency) return res.status(404).json({ message: 'Currency not found' });
    res.json(currency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCurrency = async (req, res) => {
  try {
    const currency = await Currency.findByPk(req.params.id);
    if (!currency) return res.status(404).json({ message: 'Currency not found' });
    
    await currency.destroy();
    res.json({ message: 'Currency deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
