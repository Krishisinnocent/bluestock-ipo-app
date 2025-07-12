const pool = require('../../config/db');

const createTables = async () => {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('investor', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ipos (
        ipo_id SERIAL PRIMARY KEY,
        company_name VARCHAR(100) NOT NULL,
        symbol VARCHAR(20) UNIQUE NOT NULL,
        price_range NUMERIC(10, 2),
        open_date DATE,
        close_date DATE,
        min_investment NUMERIC(10, 2),
        status VARCHAR(20) CHECK (status IN ('upcoming', 'open', 'closed', 'listed'))
        );

       CREATE TABLE IF NOT EXISTS subscriptions (
        subscription_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id),
        ipo_id INT REFERENCES ipos(ipo_id),
        lot_size INT NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'refunded'))
      );

       CREATE TABLE IF NOT EXISTS transactions (
        transaction_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id),
        subscription_id INT REFERENCES subscriptions(subscription_id),
        amount NUMERIC(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(20) CHECK (status IN ('success', 'failed', 'pending')),
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tables created successfully");
    } catch(err){
        console.error("Error creating tables: ", err);
    } finally{
        pool.end();
    }
}

createTables();