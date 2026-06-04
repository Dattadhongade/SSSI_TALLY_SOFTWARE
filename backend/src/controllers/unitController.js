const { Unit } = require('../models');

exports.createUnit = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] || req.body.companyId || null;
    const financialYearId = req.headers['x-financial-year-id'] || req.body.financialYearId || null;
    const userId = req.user?.id || null;

    const payload = { ...req.body, companyId, financialYearId, userId };

    // Update existing
    if (req.params.id) {
      const unit = await Unit.findByPk(req.params.id);
      if (unit) {
        await unit.update(payload);
        return res.json(unit);
      }
      return res.status(404).json({ message: 'Unit not found' });
    }

    const unit = await Unit.create(payload);
    res.status(201).json(unit);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save unit', error: error.message });
  }
};

exports.getUnits = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] || null;
    const where = companyId ? { companyId } : {};
    const units = await Unit.findAll({ where });
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    res.json(unit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    
    await unit.destroy();
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
