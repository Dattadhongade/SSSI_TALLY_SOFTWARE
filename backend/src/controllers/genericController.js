exports.createGenericController = (Model) => ({
  getAll: async (req, res) => {
    try {
      const records = await Model.findAll({ where: { companyId: req.user.companyId || req.query.companyId } });
      res.json(records);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching records', error: err.message });
    }
  },
  getById: async (req, res) => {
    try {
      const record = await Model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ message: 'Record not found' });
      res.json(record);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching record', error: err.message });
    }
  },
  create: async (req, res) => {
    try {
      const record = await Model.create({ ...req.body, companyId: req.user.companyId || req.body.companyId });
      res.status(201).json(record);
    } catch (err) {
      res.status(500).json({ message: 'Error creating record', error: err.message });
    }
  },
  update: async (req, res) => {
    try {
      const record = await Model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ message: 'Record not found' });
      await record.update(req.body);
      res.json(record);
    } catch (err) {
      res.status(500).json({ message: 'Error updating record', error: err.message });
    }
  },
  delete: async (req, res) => {
    try {
      const record = await Model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ message: 'Record not found' });
      await record.destroy();
      res.json({ message: 'Record deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting record', error: err.message });
    }
  }
});
