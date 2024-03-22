//Importar bibliotecas
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

require('dotenv').config();

//CREAR VARIABLES
const server = express();
const serverPort = 4000;

// CREATE AND CONFIG SERVER
server.use(cors());
server.use(express.json());

// CONFIGURACIÓN DE MYSQL

async function getConnection() {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS, 
      database: process.env.MYSQL_DB,
    });
  
    await connection.connect();
  
    // console.log(
    //   `Conexión establecida con la base de datos (identificador=${connection.threadId})`
    // );
  
    return connection;
  }
  
  // Arrancar el servidor:
    server.listen(serverPort, () => {
    console.log(`Server listening at http://localhost:${serverPort}`);
  });

// 1. Endpoint para obtener todas las recetas:

  server.get("/api/recetas", async (req, res) => {
    //1. conectar a la base de datos:   
    const conn = await getConnection(); 
  
    //2. Lanzar un SELECT para recuperar todas las recetas de la bbdd:
      const queryGetRecetas = `
      SELECT * FROM recetas_db.recetas;
    `;

    //3. Obtenemos resultados:  
    const [results] = await conn.query(queryGetRecetas);

    // 4. Cerramos conexión a la base de datos:
      conn.close();

    // 5. Devuelvo un json con los resultados:
    res.json({
        // número de elementos
        "info": `Listado de Recetas`,
        "número de Recetas": results.length,
        // listado
        "results": results,
    });
  });

// 2. Endpoint para obtener una receta por su ID:
 server.get("/api/recetas/:id", async (req, res) => {
    //1. conectar a la base de datos:   
    const conn = await getConnection();

    //2. Lanzar una query con SELECT y WHERE para recuperar las recetas por ID:
    const queryGetRecetasId = `
    SELECT * FROM recetas_db.recetas 
    WHERE id = ?`;

    //3. Obtenemos resultados:  
  const [ResultRecetaId] = await conn.execute(queryGetRecetasId, [req.params.id]);

    // 4. Cerramos conexión a la base de datos:
    conn.close();

    // 5. Devuelvo un json con los resultados:
    res.json({
      // número de elementos
      "info": `Receta`,
      // Resultado
      "results": ResultRecetaId, 
    });
  });

// 3. Endpoint para obtener una receta por su ID:
server.post("/api/recetas", async (req, res) => {
    req.body = {nombre, ingredientes, instrucciones}

    try {
      if( !nombre || nombre ==='') {
        res.status(400).json(createErrorResponse('Rellenar todos los campos es obligatorio. Por favor, no olvides introducir el nombre de la receta. Gracias'));
        return;
      }
      if( !ingredientes || ingredientes ==='') {
        res.status(400).json(createErrorResponse('Rellenar todos los campos es obligatorio. Por favor, no olvides escribir los ingredientes de la receta. Gracias'));
        return;
      }
      if( !instrucciones || instrucciones ==='') {
        res.status(400).json(createErrorResponse('Rellenar todos los campos es obligatorio. Por favor, no olvides poner las instrucciones de la receta. Gracias'));
        return;
      }
      else {
        // 1. Conectar a la bbdd:
        const conn = await getConnection();

        //2. Lanzar una query con Insert:
        const InsertReceta = `
        INSERT INTO recetas (nombre, ingredientes, instrucciones) VALUES (?, ?, ?);
        `;

        //3. Obtenemos resultados:
        const [insertResult] = await conn.execute(InsertReceta, [nombre, ingredientes, instrucciones]);

        // 5. Recupero el id de Projects
        const idNuevaReceta = insertResult.insertId;

        // 4. Cerramos conexión a la base de datos:
        conn.end();

        // 5. Devuelvo un json con los resultados:

        if (insertResult.affectedRows === 1){
          res.json(
            {
              "success": true,
              // id que generó MySQL para la nueva fila
              "id": idNuevaReceta,
            }
          );
        }
      
        else {
          res.json({
            success: false,
            error: 'Ha habido un error en la base de datos. Por favor, vuelve a intentarlo más tarde. Gracias.'
          });
        }
    }
  }
    catch(error) {
      res.json({
        success: false,
        error: 'Ha habido un error en la base de datos. Por favor, vuelve a intentarlo más tarde. Gracias.'
      });
    }
  });

// SERVIDOR ESTÁTICOS
server.use( express.static('./public') );