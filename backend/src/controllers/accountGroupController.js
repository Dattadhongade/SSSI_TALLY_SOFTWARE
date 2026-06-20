const { AccountGroup } = require('../models');

exports.createGroup = async (req, res) => {
  try {
    const { name, alias, parentGroupId, isRevenue } = req.body;
    const group = await AccountGroup.create({ name, alias, parentGroupId, isRevenue });
    res.status(201).json({ message: 'Account Group created successfully', group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await AccountGroup.findAll();
    res.json(groups);
  } catch (error) {
    console.error('Fetch groups error:', error);
    res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, alias, parentGroupId, isRevenue } = req.body;
    await AccountGroup.update({ name, alias, parentGroupId, isRevenue }, { where: { id } });
    res.json({ message: 'Account Group updated successfully' });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Failed to update group', error: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    await AccountGroup.destroy({ where: { id } });
    res.json({ message: 'Account Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Failed to delete group', error: error.message });
  }
};
