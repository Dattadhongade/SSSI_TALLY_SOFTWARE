require('dotenv').config();
const { Company, User, FinancialYear } = require('./src/models');

async function test() {
  try {
    const companies = await Company.findAll({
      include: [
        {
          model: User,
        },
        {
          model: FinancialYear
        }
      ]
    });
    console.log(companies);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
