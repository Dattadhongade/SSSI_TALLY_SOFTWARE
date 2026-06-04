require('dotenv').config();
const { Company, User, FinancialYear } = require('./src/models');

async function debugGetCompanies() {
  try {
    // Simulate user 1
    const userId = 1;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    console.log("Found User:", user ? user.toJSON() : 'Not Found');
    
    if (!user) {
      console.log("No user, creating one for test.");
      await User.create({ id: 1, name: 'Test', email: 'test@test.com', password_hash: '123' });
    }

    const companies = await Company.findAll({
      include: [
        {
          model: require('./src/models').User,
          where: { id: 1 },
          through: { attributes: [] }
        },
        {
          model: require('./src/models').FinancialYear
        }
      ]
    });
    
    console.log("COMPANIES:", JSON.stringify(companies, null, 2));
  } catch (err) {
    console.error("GET COMPANIES ERROR:", err);
  }
}

debugGetCompanies();
