const pool = require('../config/db');

class IPO{
    static async create({
        company_name,
        symbol,
        price_range,
        open_date,
        close_date,
        min_investment,
        status = 'upcoming'
    }){
        const query = `
        INSERT INTO ipos(
        company_name, symbol, price_range,
        open_date, close_date, min_investment, status
        )
        VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `;
        const values = [
            company_name,
            symbol, 
            price_range, 
            open_date, 
            close_date,
            min_investment,
            status
        ];
        const {rows} = await pool.query(query, values);
        return rows[0];
    }

    static async findAll(){
        const query = 'SELECT * FROM ipos ORDER BY open_date DESC';
        const {rows} = await pool.query(query);
        return rows;
    }

    static async findById(ipoId){
        const query = 'SELECT * FROM ipos WHERE ipo_id = $1';
        const {rows} = await pool.query(query, [ipoId]);
        return rows[0];
    }

    static async update(ipoId, updateData){
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        values.push(ipoId);

        const setClause = fields.map((field, index)=> `${field} = ${index + 1}`).join(', ');

        const query = `
        UPDATE ipos
        SET ${setClause}
        WHERE ipo_id = $${fields.length + 1}
        RETURNING *
        `;

        const {rows} = await pool.query(query, values);
        return rows[0];
    }

    static async delete(ipoId){
        const query = 'DELETE FROM ipos WHERE ipo_id = $1 RETURNING *';
        const { rows } = await pool.query(query, [ipoId]);
        return rows[0];
    }
}

module.exports = IPO;