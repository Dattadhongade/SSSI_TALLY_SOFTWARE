require('dotenv').config();
const { Company, CompanyUser, FinancialYear, User } = require('./src/models');

async function debugCreateCompany() {
  try {
    // Simulate user 1
    const userId = 1;

    // Create the company
    const company = await Company.create({
      name: "Test Company",
      financialYearStart: "2026-04-01",
      booksBeginningFrom: "2026-04-01"
    });
    
    // Assign user to company
    await CompanyUser.create({
      companyId: company.id,
      userId: userId,
      status: 'Active'
    });

    console.log("SUCCESS!");
  } catch (error) {
    console.error('Create company error:', error);
  }
}

debugCreateCompany();
