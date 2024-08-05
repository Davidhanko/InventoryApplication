const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../dot.env') })

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    })

module.exports = pool;