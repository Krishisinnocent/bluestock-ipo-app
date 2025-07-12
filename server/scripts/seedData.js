const { faker } = require('@faker-js/faker');
const pool = require('../../config/db');

const addTransactions = async () => {
  try {
    // Fetch existing subscriptions (excluding already linked ones)
    const subscriptions = await pool.query(`
      SELECT s.subscription_id, s.user_id, s.status 
      FROM subscriptions s
      LEFT JOIN transactions t ON s.subscription_id = t.subscription_id
      WHERE t.transaction_id IS NULL
    `);

    const paymentMethods = ['credit_card', 'bank_transfer', 'upi'];
    
    for (const sub of subscriptions.rows) {
      // Only add transactions for non-rejected subscriptions
      if (sub.status !== 'rejected') {
        await pool.query(
          `INSERT INTO transactions (user_id, subscription_id, amount, payment_method, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            sub.user_id,
            sub.subscription_id,
            faker.number.float({ min: 1000, max: 50000, precision: 0.01 }),
            faker.helpers.arrayElement(paymentMethods),
            sub.status === 'approved' ? 'success' : 'pending'
          ]
        );
      }
    }

    console.log(`✅ Added ${subscriptions.rowCount} transactions`);
  } catch (err) {
    console.error("❌ Error adding transactions:", err);
  } finally {
    pool.end();
  }
};

addTransactions();