const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class User{
    static async create({name, email, password, role = 'investor'})
    {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
          INSERT INTO users(name, email, password_hash, role)
          VALUES($1, $2, $3, $4)
          RETURNING user_id, name, email, role, created_at
        `;

        const values = [name, email, hashedPassword, role];
        const {rows} = await pool.query(query, values);
        return rows[0];
    }

    static async findAll(){
      const query = `SELECT user_id, name, email, role, created_at FROM users ORDER BY created_at DESC`;
      const {rows} = await pool.query(query);
      return rows;
    }

    static async update(userId, updateData) {
  const fields = Object.keys(updateData);
  const values = Object.values(updateData);
  values.push(userId);

  // Dynamically build SET clause
  const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

  const query = `UPDATE users SET ${setClause} WHERE user_id = $${fields.length + 1} RETURNING user_id, name, email, role, created_at`;
  const { rows } = await pool.query(query, values);
  return rows[0];
}

static async findByEmail(email){
  const query = 'SELECT * FROM users WHERE email = $1';
  const {rows} = await pool.query(query, [email]);
  return rows[0]
  }

static async findById(userId){
  const query = 'SELECT user_id, name, email, role, created_at FROM users WHERE user_id = $1';
  const {rows} = await pool.query(query, [userId]);
  return rows[0];
}

static async comparePassword(email, password){
  const user = await this.findByEmail(email);
  if(!user) return false;
  return await bcrypt.compare(password, user.password_hash);
}

static generateAuthToken(user){
  return jwt.sign(
    {userId: user.user_id, email: user.email, role: user.role},
    process.env.JWT_SECRET,
    {expiresIn: '24h'}
  );
}
}

module.exports = User;