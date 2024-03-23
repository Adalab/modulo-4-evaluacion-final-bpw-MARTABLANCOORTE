//Importar bibliotecas
const { getConnection2 } = require("../Models-Controllers/dbUsuarios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//LOGIN
exports.create = async (req, res) => {
  try {
    if (!req.body.user || req.body.user === "") {
      res.status(400).json({
        error: "No olvide escribir el usuario. Gracias",
      });
      return;
    }
    if (!req.body.password || req.body.password === "") {
      res.status(400).json({
        error: "No olvide escribir la contraseña. Gracias",
      });
      return;
    } else {
    // 1. Conectar a la bbdd:
      const conn = await getConnection2();

    //2. Comprobar si el email está registrado, y si lo está devolver mensaje de error:
      const queryCheckUsers = `
              SELECT *
                FROM usuarios
                WHERE user = ?
              `;

      const [resultsUsers] = await conn.query(queryCheckUsers, [req.body.user]);

      conn.end();

      if (resultsUsers.length !== 1) {
        res.json({
          success: false,
          error:
            "El usuario no está resgistrado. Por favor, registrese primero.",
        });
        return;
      }

    // 3. Comparamos la contraseña de la bbdd con la que nos envía el front-end
      //  - Si no es la misma, mensaje de vuelta
      // Devolvemos los datos de la Adalaber

    //4. Lanzar un search:
      const querySearchUser = `
        SELECT *
          FROM usuarios
          WHERE user = ?
      `;
    //5. Obtener resultados:
      const [results] = await conn.query(querySearchUser, [req.body.user, req.body.password]);

    //6. Desconexión de la bbdd:
      conn.end();

    //7. Guadrar resultados:
      const userdata = results[0];
    
    //8. Compraración de contraseña guardada e introducida:
      const correctPassword = await bcrypt.compare(
        req.body.pass,
        userdata.pass
      );

      if (!correctPassword) {
        res.json({ success: false, error: "La contraseña es incorrecta. Pruebe de nuevo." });
        return;
      }

      const userForToken = {
        id: userdata.id,
        username: userdata.user,
      };

      const token = generateToken(userForToken);

      res.json({
        success: true,
        token: token,
        // username: userdata.name,
        // userid: userdata.id,
      });
    }
  }
catch (error) {
    res.json({
      success: false,
      error:
        "Ha habido un error en la base de datos. Por favor, vuelva a intentarlo más tarde. Gracias.",
    });
}};

