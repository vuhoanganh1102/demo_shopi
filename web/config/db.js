import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // Load biến môi trường từ .env

// Tạo kết nối MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DBNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Kết nối dưới dạng Promise
const dbMySQL = pool.promise();

// Kiểm tra kết nối
// dbMySQL
//   .getConnection()
//   .then((connection) => {
//     console.log("✅ MySQL Database connected successfully!");
//     connection.release(); // Giải phóng kết nối sau khi kiểm tra
//   })
//   .catch((error) => {
//     console.error("❌ MySQL Connection Failed:", error.message);
//   });

export default dbMySQL;
