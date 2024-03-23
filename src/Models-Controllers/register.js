//Importar bibliotecas
const { getConnection2 } = require('../Models-Controllers/dbUsuarios');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

//LOGIN
exports.create = async (req, res) => {
  try {
    if (!req.body.email || req.body.email === "") {
      res.status(400).json({
        error:
          "Rellenar todos los campos es obligatorio. Por favor, no olvide introducir el email. Gracias",
      });
      return;
    }
    if (!req.body.user || req.body.user === "") {
      res.status(400).json({
        error:
          "Rellenar todos los campos es obligatorio. Por favor, no olvide escribir el usuario. Gracias",
      });
      return;
    }
    if (req.body.user.includes(" ")) {
      res.status(400).json({
        success: false,
        error: "El nombre de usuaria no puede contener espacios",
      });
      return;
    }
    if (!req.body.nombre || req.body.nombre === "") {
      res.status(400).json({
        error:
          "Rellenar todos los campos es obligatorio. Por favor, no olvide introducir su nombre. Gracias",
      });
      return;
    }
    if (!req.body.password || req.body.password === "") {
      res.status(400).json({
        error:
          "Rellenar todos los campos es obligatorio. Por favor, no olvides poner las instrucciones de la receta. Gracias",
      });
      return;
    }
    if (req.body.password.length < 8) {
      res.status(400).json({
        success: false,
        error: "La contraseña debe tener como mínimo 8 caracteres.",
      });
      return;
    }
    if (!/\d/.test(req.body.password)) {
      res.status(400).json({
        success: false,
        error: "La contraseña debe tener algún dígito.",
      });
      return;
    }
    //No funciona la expresión: 
    // if (!/^(?=.*\d)(?=.*[a-z])(?=.*[\W_])[\d\w]+$/i.test(req.body.password)){
    //   res.status(400).json({
    //     success: false,
    //     error: "La contraseña debe tener algún símbolo y mayuscula.",
    //   });
    //   return;
    // } 
    else {
      // 1. Conectar a la bbdd:
      const conn = await getConnection2();

      //2. Comprobar si el email está registrado, y si lo está devolver mensaje de error: 
        const queryCheckEmail = `
        SELECT *
          FROM usuarios
          WHERE email = ?
        `;
      
        const [resultsEmail] = await conn.query(queryCheckEmail, [req.body.email]);
      
        if( resultsEmail.length > 0 ) {
          res.json({success:false, error: 'El email ya está registrado'});
          conn.end();
          return;
        }

      //3. Comprobar si el user está registrado, y si lo está devolver mensaje de error: 
        const queryCheckUser = `
        SELECT *
          FROM usuarios
          WHERE user = ?
        `;
      
        const [resultsUser] = await conn.query(queryCheckUser, [req.body.user]);
      
        if( resultsUser.length > 0 ) {
          res.json({success:false, error: 'El usuario ya existe'});
          conn.end();
          return;
        }

      //4. Lanzar una query con Insert:
      const InsertUsuario = `
        INSERT INTO usuarios (email, user, nombre, password) VALUES (?, ?, ?, ?);
        `;

      //5. Encriptado de contraseña:
      const crypedPass = await bcrypt.hash( req.body.password, 10 );

      //5. Obtenemos resultados:
      const [insertResult] = await conn.execute(InsertUsuario, [
        req.body.email,
        req.body.user,
        req.body.nombre,
        crypedPass,
      ]);

      //6. Recupero el id de Projects
      const idNuevoUsuario = insertResult.insertId;

      //7. Cerramos conexión a la base de datos:
      conn.end();

      //8. Devuelvo un json con los resultados:
      if (insertResult.affectedRows === 1) {
        res.json({
          success: true,
          // id que generó MySQL para la nueva fila
          id: idNuevoUsuario,
        });
      }
    }
  } catch (error) {
    res.json({
      success: false,
      error:
        "Ha habido un error en la base de datos. Por favor, vuelva a intentarlo más tarde. Gracias.",
    });
  }
};

