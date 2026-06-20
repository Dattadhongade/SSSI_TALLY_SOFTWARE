const { StockGroup } = require('../models');

exports.createStockGroup = async (req, res) => {
  try {
    const { name, alias, parentGroupId } = req.body;
    const group = await StockGroup.create({ name, alias, parentGroupId });
    res.status(201).json({ message: 'Stock Group created successfully', group });
  } catch (error) {
    console.error('Create stock group error:', error);
    res.status(500).json({ message: 'Failed to create stock group', error: error.message });
  }
};

exports.getStockGroups = async (req, res) => {
  try {
    const groups = await StockGroup.findAll();
    res.json(groups);
  } catch (error) {
    console.error('Fetch stock groups error:', error);
    res.status(500).json({ message: 'Failed to fetch stock groups', error: error.message });
  }
};

exports.updateStockGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, alias, parentGroupId } = req.body;
    await StockGroup.update({ name, alias, parentGroupId }, { where: { id } });
    res.json({ message: 'Stock Group updated successfully' });
  } catch (error) {
    console.error('Update stock group error:', error);
    res.status(500).json({ message: 'Failed to update stock group', error: error.message });
  }
};

exports.deleteStockGroup = async (req, res) => {
  try {
    const { id } = req.params;
    await StockGroup.destroy({ where: { id } });
    res.json({ message: 'Stock Group deleted successfully' });
  } catch (error) {
    console.error('Delete stock group error:', error);
    res.status(500).json({ message: 'Failed to delete stock group', error: error.message });
  }
};
