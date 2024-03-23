const mysql = require('mysql2/promise');
require('dotenv').config()

// CONFIGURACIÓN DE MYSQL

async function getConnection2() {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: "usuarios_db",
    });
  
    await connection.connect();
  
    // console.log(
    //   `Conexión establecida con la base de datos (identificador=${connection.threadId})`
    // );
  
    return connection;
}

exports.getConnection2 = getConnection2;