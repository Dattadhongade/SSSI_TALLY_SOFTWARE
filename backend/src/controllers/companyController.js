const { Company, CompanyUser, FinancialYear, Currency, Unit } = require('../models');

exports.createCompany = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    
    // Create the company
    const company = await Company.create(req.body);
    
    // Assign user to company
    await CompanyUser.create({
      companyId: company.id,
      company_id: company.id,
      userId: userId,
      user_id: userId,
      status: 'Active'
    });

    // Auto-create Financial Year based on input or default to current logic
    const startInput = new Date(req.body.financialYearStart || Date.now());
    let startYear = startInput.getFullYear();
    if (startInput.getMonth() < 3) startYear -= 1;
    
    const yearName = `${startYear}-${startYear + 1}`;
    const startDate = `${startYear}-04-01`;
    const endDate = `${startYear + 1}-03-31`;

    const financialYear = await FinancialYear.create({
      companyId: company.id,
      company_id: company.id,
      yearName: yearName,
      year_name: yearName,
      startDate: startDate,
      start_date: startDate,
      endDate: endDate,
      end_date: endDate,
      isActive: true,
      is_active: true,
      createdBy: userId,
      created_by: userId
    });

    // Auto-create Default Currencies
    await Currency.create({
      companyId: company.id,
      userId: userId,
      symbol: '₹',
      formalName: 'INR',
      isoCode: 'INR',
      decimalPlaces: 2,
      showInMillions: false,
      suffixSymbol: false,
      spaceBeforeSymbol: true,
      wordForDecimal: 'Paise',
      decimalPlacesForWords: 2
    });

    await Currency.create({
      companyId: company.id,
      userId: userId,
      symbol: '$',
      formalName: 'USD',
      isoCode: 'USD',
      decimalPlaces: 2,
      showInMillions: false,
      suffixSymbol: false,
      spaceBeforeSymbol: true,
      wordForDecimal: 'Cents',
      decimalPlacesForWords: 2
    });

    // Auto-create Default Units
    const defaultUnits = [
      { symbol: 'Nos', formalName: 'Numbers' },
      { symbol: 'Kg', formalName: 'Kilograms' },
      { symbol: 'Pcs', formalName: 'Pieces' },
      { symbol: 'Box', formalName: 'Boxes' }
    ];
    for (const unit of defaultUnits) {
      await Unit.create({
        companyId: company.id,
        userId: userId,
        symbol: unit.symbol,
        formalName: unit.formalName
      });
    }

    // Auto-create Default Voucher Types
    const { VoucherType } = require('../models');
    const defaultVoucherTypes = [
      { name: 'Sales', typeOfVoucher: 'Sales', methodOfVoucherNumbering: 'Automatic', prefix: 'SSSI/' },
      { name: 'Purchase', typeOfVoucher: 'Purchase', methodOfVoucherNumbering: 'Automatic', prefix: 'PUR/' },
      { name: 'Receipt', typeOfVoucher: 'Receipt', methodOfVoucherNumbering: 'Automatic', prefix: 'REC/' },
      { name: 'Payment', typeOfVoucher: 'Payment', methodOfVoucherNumbering: 'Automatic', prefix: 'PAY/' },
      { name: 'Contra', typeOfVoucher: 'Contra', methodOfVoucherNumbering: 'Automatic', prefix: 'CON/' },
      { name: 'Journal', typeOfVoucher: 'Journal', methodOfVoucherNumbering: 'Automatic', prefix: 'JRN/' }
    ];
    
    for (const vt of defaultVoucherTypes) {
      await VoucherType.create({
        ...vt,
        companyId: company.id,
        userId: userId
      });
    }

    res.status(201).json({ 
      message: 'Company created successfully', 
      company,
      financialYear
    });
  } catch (error) {
    console.error('Create company error details:', error);
    res.status(500).json({ message: 'Failed to create company', error: error.message, stack: error.stack });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get all companies this user has access to, including their Financial Years
    const companies = await Company.findAll({
      include: [
        {
          model: require('../models').User,
          where: { id: userId },
          through: { attributes: [] } // Exclude pivot data
        },
        {
          model: require('../models').FinancialYear
        }
      ]
    });
    res.json(companies);
  } catch (error) {
    console.error('Fetch companies error:', error);
    res.status(500).json({ message: 'Failed to fetch companies', error: error.message, stack: error.stack });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await Company.findOne({
      where: { id: req.params.id },
      include: [{
        model: require('../models').User,
        where: { id: userId },
        through: { attributes: [] }
      }]
    });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found or access denied' });
    }
    res.json(company);
  } catch (error) {
    console.error('Fetch company error:', error);
    res.status(500).json({ message: 'Failed to fetch company' });
  }
};

exports.updateGstDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await Company.findOne({
      where: { id: req.params.id },
      include: [{
        model: require('../models').User,
        where: { id: userId },
        through: { attributes: [] }
      }]
    });
    
    if (!company) return res.status(404).json({ message: 'Company not found or access denied' });
    
    await company.update(req.body);
    res.json({ message: 'GST Details updated successfully', company });
  } catch (error) {
    console.error('Update GST error:', error);
    res.status(500).json({ message: 'Failed to update GST details', error: error.message });
  }
};

exports.getFinancialYears = async (req, res) => {
  try {
    const userId = req.user.id;
    // Verify access to company first
    const company = await Company.findOne({
      where: { id: req.params.id },
      include: [{
        model: require('../models').User,
        where: { id: userId },
        through: { attributes: [] }
      }]
    });
    
    if (!company) return res.status(404).json({ message: 'Company not found or access denied' });

    const fYears = await FinancialYear.findAll({
      where: { company_id: req.params.id },
      order: [['start_date', 'DESC']]
    });
    
    res.json(fYears);
  } catch (error) {
    console.error('Fetch FY error:', error);
    res.status(500).json({ message: 'Failed to fetch financial years' });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await Company.findOne({
      where: { id: req.params.id },
      include: [{
        model: require('../models').User,
        where: { id: userId },
        through: { attributes: [] }
      }]
    });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found or access denied' });
    }
    
    await company.update(req.body);
    res.json({ message: 'Company updated successfully', company });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Failed to update company', error: error.message });
  }
};
