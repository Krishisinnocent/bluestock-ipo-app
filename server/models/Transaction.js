const pool = require('../config/db');

class Transaction{
    static async findByUser(user){
        const query = `
      SELECT t.*, i.company_name, i.symbol
      FROM transactions t
      JOIN subscriptions s ON t.subscription_id = s.subscription_id
      JOIN ipos i ON s.ipo_id = i.ipo_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC
      `;
      const { rows } = await pool.query(query, [userId]);
      return rows;
    }

     static async findBySubscription(subscriptionId) {
    const query = 'SELECT * FROM transactions WHERE subscription_id = $1';
    const { rows } = await pool.query(query, [subscriptionId]);
    return rows[0];
  }

   static async updateStatus(transactionId, status) {
    const query = `
      UPDATE transactions
      SET status = $1
      WHERE transaction_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, transactionId]);
    return rows[0];
  }
}

module.exports = Transaction;