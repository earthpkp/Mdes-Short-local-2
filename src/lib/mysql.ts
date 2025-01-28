import mysql from 'mysql2/promise';

// Create a connection pool
export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'url_shortener',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});