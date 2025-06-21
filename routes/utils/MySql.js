var mysql = require('mysql2');
require("dotenv").config();


const config={
connectionLimit:4,
  host: process.env.host,//"localhost"
  user: process.env.user,//"root"
  password: process.env.DBpassword,
  database:process.env.database
  // database:"mydb"
}

console.log("Database config:", {
  host: config.host,
  user: config.user,
  database: config.database,
  passwordLength: config.password ? config.password.length : 0
});

const pool = new mysql.createPool(config);

const connection =  () => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("MySQL connection error:", err);
      reject(err);
      return;
    }
    console.log("MySQL pool connected: threadId " + connection.threadId);
    const query = (sql, binding) => {
      return new Promise((resolve, reject) => {
         connection.query(sql, binding, (err, result) => {
           if (err) reject(err);
           resolve(result);
           });
         });
       };       const release = () => {
         return new Promise((resolve, reject) => {
           try {
             console.log("MySQL pool released: threadId " + connection.threadId);
             connection.release();
             resolve();
           } catch (error) {
             reject(error);
           }
         });
       };
       resolve({ query, release });
     });
   });
 };
const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) {
        console.error("Database query error:", err.message);
        // For development, return empty result instead of crashing
        if (process.env.NODE_ENV !== 'production') {
          console.log("Returning empty result for development");
          resolve([]);
          return;
        }
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};
module.exports = { pool, connection, query };







