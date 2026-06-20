const { StockItem } = require('../models');

const sanitizeData = (data) => {
  const sanitized = { ...data };
  if (sanitized.stockGroupId === '') sanitized.stockGroupId = null;
  if (sanitized.unitId === '') sanitized.unitId = null;
  if (sanitized.gstRate === '') sanitized.gstRate = null;
  if (sanitized.openingQuantity === '') sanitized.openingQuantity = 0;
  if (sanitized.openingRate === '') sanitized.openingRate = 0;
  if (sanitized.openingValue === '') sanitized.openingValue = 0;
  if (sanitized.purchaseRate === '') sanitized.purchaseRate = 0;
  if (sanitized.salesRate === '') sanitized.salesRate = 0;
  if (sanitized.reorderLevel === '') sanitized.reorderLevel = 0;
  if (sanitized.minimumStock === '') sanitized.minimumStock = 0;
  if (sanitized.maximumStock === '') sanitized.maximumStock = 0;
  return sanitized;
};

exports.createStockItem = async (req, res) => {
  try {
    const data = sanitizeData(req.body);
    const stockItem = await StockItem.create(data);
    res.status(201).json({ message: 'Stock Item created successfully', stockItem });
  } catch (error) {
    console.error('Create stock item error:', error);
    res.status(500).json({ message: 'Failed to create stock item', error: error.message });
  }
};

exports.getStockItems = async (req, res) => {
  try {
    const items = await StockItem.findAll();
    res.json(items);
  } catch (error) {
    console.error('Fetch stock items error:', error);
    res.status(500).json({ message: 'Failed to fetch stock items' });
  }
};

exports.getStockItemById = async (req, res) => {
  try {
    const stockItem = await StockItem.findByPk(req.params.id);
    if (!stockItem) return res.status(404).json({ message: 'Stock item not found' });
    res.json(stockItem);
  } catch (error) {
    console.error('Fetch stock item error:', error);
    res.status(500).json({ message: 'Failed to fetch stock item' });
  }
};

exports.updateStockItem = async (req, res) => {
  try {
    const data = sanitizeData(req.body);
    const stockItem = await StockItem.findByPk(req.params.id);
    if (!stockItem) return res.status(404).json({ message: 'Stock item not found' });
    
    await stockItem.update(data);
    res.json({ message: 'Stock item updated successfully', stockItem });
  } catch (error) {
    console.error('Update stock item error:', error);
    res.status(500).json({ message: 'Failed to update stock item', error: error.message });
  }
};

exports.deleteStockItem = async (req, res) => {
  try {
    const stockItem = await StockItem.findByPk(req.params.id);
    if (!stockItem) return res.status(404).json({ message: 'Stock item not found' });
    
    await stockItem.destroy();
    res.json({ message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Delete stock item error:', error);
    res.status(500).json({ message: 'Failed to delete stock item', error: error.message });
  }
};
