const { use } = require("react");
const pool = require("../config/db");

class Subscription{
    static async create({ user_id, ipo_id, lot_size, status = 'pending' }){
        const query = `
         INSERT INTO subscriptions (user_id, ipo_id, lot_size, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
        `;
        const values = [user_id, ipo_id, lot_size, status];
        const {rows} = pool.query(query, values);
        return rows[0];
    }

    static async findByUser(userId){
        const query = `
        SELECT s.*, i.company_name, i.symbol, i.status as ipo_status
        FROM subscriptions s
        JOIN ipos i ON s.ipo_id = i.ipo_id
        WHERE s.user_id = $1
        ORDER BY s.applied_at DESC
        `;
        const {rows} = await pool.query(query, [userId]);
        return rows;
    }

    static async findById(subscriptionId) {
    const query = 'SELECT * FROM subscriptions WHERE subscription_id = $1';
    const { rows } = await pool.query(query, [subscriptionId]);
    return rows[0];
  }

  static async updateStatus(subscriptionId, status) {
    const query = `
      UPDATE subscriptions
      SET status = $1
      WHERE subscription_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, subscriptionId]);
    return rows[0];
  }

    static async findByIpo(ipoId) {
    const query = `
      SELECT s.*, u.name as user_name, u.email
      FROM subscriptions s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.ipo_id = $1
      ORDER BY s.applied_at DESC
    `;
    const { rows } = await pool.query(query, [ipoId]);
    return rows;
  }
}

module.exports = Subscription;