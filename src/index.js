//Importar bibliotecas
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

require("dotenv").config();

//CREAR VARIABLES
const server = express();
const serverPort = 4000;

// CREATE AND CONFIG SERVER
server.use(cors());
server.use(express.json({ limit: '25mb' }));
server.set("view engine", "ejs");

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
  try{
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
      info: `Listado de Recetas`,
      "número de Recetas": results.length,
      // listado
      results: results,
    });
  }
  catch (error) {
    res.json({
      success: false,
      error:
        "Ha habido un error en la base de datos. Por favor, vuelve a intentarlo más tarde. Gracias.",
    });
  }
});

// 2. Endpoint para obtener una receta por su ID:
server.get("/api/recetas/:id", async (req, res) => {
  try{
    //1. conectar a la base de datos:
    const conn = await getConnection();

    //2. Lanzar una query con SELECT y WHERE para recuperar las recetas por ID:
    const queryGetRecetasId = `
      SELECT * FROM recetas_db.recetas 
      WHERE id = ?`;

    //3. Obtenemos resultados:
    const [ResultRecetaId] = await conn.execute(queryGetRecetasId, [
      req.params.id,
    ]);

    // 4. Cerramos conexión a la base de datos:
    conn.close();

    // 5. Devuelvo un json con los resultados:
    res.json({
      // número de elementos
      info: `Receta`,
      // Resultado
      results: ResultRecetaId,
    });
  }
  catch (error) {
    res.json({
      success: false,
      error:
        "Ha habido un error en la base de datos. Por favor, vuelve a intentarlo más tarde. Gracias.",
    });
  }
});

// 3. Endpoint para obtener una receta por su ID:
server.post("/api/recetas", async (req, res) => {
  try {
    if (!req.body.nombre || req.body.nombre === "") {
      res
        .status(400)
        .json({ error:"Rellenar todos los campos es obligatorio. Por favor, no olvides introducir el nombre de la receta. Gracias"});
      return;
    }
    if (!req.body.ingredientes || req.body.ingredientes === "") {
      res
        .status(400)
        .json({ error:"Rellenar todos los campos es obligatorio. Por favor, no olvides escribir los ingredientes de la receta. Gracias"});
      return;
    }
    if (!req.body.instrucciones || req.body.instrucciones === "") {
      res
        .status(400)
        .json({ error:"Rellenar todos los campos es obligatorio. Por favor, no olvides poner las instrucciones de la receta. Gracias"});
      return;
    } else {
      // 1. Conectar a la bbdd:
      const conn = await getConnection();

      //2. Lanzar una query con Insert:
      const InsertReceta = `
        INSERT INTO recetas (nombre, ingredientes, instrucciones) VALUES (?, ?, ?);
        `;

      //3. Obtenemos resultados:
      const [insertResult] = await conn.execute(InsertReceta, [
        req.body.nombre,
        req.body.ingredientes,
        req.body.instrucciones,
      ]);

      // 4. Recupero el id de Projects
      const idNuevaReceta = insertResult.insertId;

      // 5. Cerramos conexión a la base de datos:
      conn.end();

      // 6. Devuelvo un json con los resultados:
      if (insertResult.affectedRows === 1) {
        res.json({
          success: true,
          // id que generó MySQL para la nueva fila
          id: idNuevaReceta,
        });
      }
    }
  }
  catch (error) {
    res.json({
      success: false,
      error:
        "Ha habido un error en la base de datos. Por favor, vuelve a intentarlo más tarde. Gracias.",
    });
  }
});

//4. Endpoint actualizar una receta existente: 
server.put('/api/recetas/:id', async (req, res) => {
  try {
    //1. conectar a la base de datos:
    const conn = await getConnection();

    //2. Lanzar una query con UPDATE para actualizar una receta existente:
    const updateReceta = `
      UPDATE recetas_db.recetas
        SET nombre = ?, ingredientes = ?, instrucciones = ?
        WHERE id = ?
    `;

     //3. Obtenemos resultados:
    const [updateResult] = await conn.execute(updateReceta, [
      req.body.nombre,
      req.body.ingredientes,
      req.body.instrucciones,
      req.params.id,
    ]);
    
    console.log (updateResult);

    //4. Cerramos conexión a la base de datos:
    conn.end();
    
    // 5. Devuelvo un json con los resultados:
    res.json({
      success: true,
      mensaje: "La receta se ha actualizado correctamente."
    });
  }
  catch(error) {
    res.json({
      success: false,
      error: "Ha habido un error en la base de datos. Por favor, vuelve a intentarlo más tarde. Gracias."
    });
  }
});

// 5. Endpoint para borrar una receta existente:
  server.delete('/api/recetas/:id', async (req, res) => {
    try {
      //1. conectar a la base de datos:
      const conn = await getConnection();
  
      //2. Lanzar una query con DELETE para borrar una receta existente:
      const deleteReceta = `
        DELETE FROM recetas WHERE id = ?
      `;
  
      //3. Obtenemos resultados:
      const [deleteResult] = await conn.execute(deleteReceta, [req.params.id]);
  
      //4. Cerramos conexión a la base de datos:
      conn.end();
  
      // 5. Devuelvo un json con los resultados:
      res.json({
        success: true,
        mensaje: "La receta se ha eliminado con éxito."
      });
    }
    catch(error) {
      res.json({
        success: false,
        error: "Ha habido un error en la base de datos. Por favor, vuelve a intentarlo más tarde. Gracias."
      });
    }
  });

// 6. Mostrar el detalle de un proyecto (serv. dinámicos)
server.get("/recetas/:id", async (req, res) => {
  try{
    //1. conectar a la base de datos:
    const conn = await getConnection();

    //2. Lanzar una query con SELECT y WHERE para recuperar las recetas por ID:
    const queryGetRecetasId = `
      SELECT * FROM recetas_db.recetas 
      WHERE id = ?`;

    //3. Obtenemos resultados:
    const [ResultRecetaId] = await conn.execute(queryGetRecetasId, [
      req.params.id,
    ]);

    // 4. Hago un template (EJS)

    // 5. Cerramos conexión a la base de datos:
    conn.close();

    // 6. Devuelvo los resultados en la plantilla : 
    const data = ResultRecetaId[0];

    // res.render('plantilla', resultado)
    res.render("details", data); 
  }
  catch (error) {
    res.json({
      success: false,
      error:
        "Ha habido un error en la base de datos. Por favor, vuelve a intentarlo más tarde. Gracias.",
    });
  }
});

// // SERVIDOR ESTÁTICOS
// server.use(express.static("./public"));

//DEFINIR SERVIDORES ESTÁTICOS
const pathServerPublicStyles = "./src/public-css";
server.use(express.static(pathServerPublicStyles));
