import pg from "pg";
import dotenv from 'dotenv';

dotenv.config();

// console.log(process.env.DB_HOST)

const db = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

// console.log(db)

export default db;