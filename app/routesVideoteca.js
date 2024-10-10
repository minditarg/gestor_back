
var bodyParser = require('body-parser');
var general = require('./functionsGeneral');
var bodyJson = bodyParser.json()


module.exports = function (app, connection, passport) {


  app.get('/list-videoteca/:idVideoteca', general.isLoggedIn, function (req, res) {
    let idVideoteca = parseInt(req.params.idVideoteca);
    try {
      connection.query("CALL videoteca_detail(?)", [[idVideoteca]], function (err, result) {
        if (err) return res.status(500).send(err);
        res.json({ success: 1, video: result[0], tags: result[1] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.get('/list-mi-videoteca/:idVideoteca', general.isLoggedIn, function (req, res) {
    let idUser = (req.user && req.user.id) || null;
    let idVideoteca = parseInt(req.params.idVideoteca);
    try {
      connection.query("CALL mi_videoteca_detail(?)", [[idVideoteca, idUser]], function (err, result) {
        if (err) return res.status(500).send(err);
        res.json({ success: 1, video: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.get('/list-videoteca', general.isLoggedIn, function (req, res) {

    try {
      connection.query("CALL videoteca_list", function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });




  

  app.post('/insert-videoteca', bodyJson, general.isLoggedIn, function (req, res) {
    let nombre = req.body.nombre || null;
    let descripcion = req.body.descripcion || null;
    let idTipoNoticia = req.body.idTipoNoticia || null;
    let idTipoCategoria = req.body.idTipoCategoria || null;
    let idUser = (req.user && req.user.id) || null;
    let fechaInicio = req.body.fechaInicio || null;
    let fechaFinalizacion = req.body.fechaFinalizacion || null;
    let contenido = req.body.contenido || null;
    let estado = req.body.estado || null;
    let destacado = req.body.destacado || null;
    let principal = req.body.principal || null;

    let tags = req.body.tags || [];
    let id_categoria_personal = req.body.id_categoria_personal || null;
    let id_categoria_transparente = req.body.id_categoria_transparente || null;


    try {
      connection.query("CALL noticias_insert(?)", [[nombre, descripcion, idTipoNoticia, idTipoCategoria, idUser, fechaInicio, fechaFinalizacion, contenido, estado, destacado, principal,id_categoria_personal,id_categoria_transparente]], function (err, resultInsert) {
        if (err) return res.status(500).send(err.sqlMessage);
        if (tags.length > 0) {

          recorrerArrayTags(0, tags, resultInsert[0][0].id_noticia, function (err, result) {

          });
        }

        res.json({ success: 1, resultInsert });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  function recorrerArrayTags(index, arrayTags, idNoticia, callback) {
    try {
      connection.query("CALL noticias_tag_insert(?)", [[idNoticia, arrayTags[index]]], function (err, result) {
        if (err) return callback(err);

        if (arrayTags.length > index + 1)
          recorrerArrayTags(index + 1, arrayTags, idNoticia, callback)
        else
          callback(err, result);

      })
    } catch (e) {
      return callback(e.message)
    }



  }


  app.post('/update-videoteca', bodyJson, general.isLoggedIn, function (req, res) {
    let idNoticia = req.body.id || null;

    let nombre = req.body.nombre || null;
    let descripcion = req.body.descripcion || null;
    let idTipoNoticia = req.body.idTipoNoticia || null;
    let fechaInicio = req.body.fechaInicio || null;
    let fechaFinalizacion = req.body.fechaFinalizacion || null;
    let contenido = req.body.contenido || null;
    let estado = req.body.estado || null;
    let idTipoCategoria = req.body.idTipoCategoria || null;
    let destacado = req.body.destacado || null;
    let principal = req.body.principal || null;
    let id_categoria_personal = req.body.id_categoria_personal || null;
    let id_categoria_transparente = req.body.id_categoria_transparente || null;


    let tags = req.body.tags || [];
    try {
      connection.query("CALL noticias_update(?)", [[idNoticia, nombre, descripcion, idTipoNoticia, idTipoCategoria, fechaInicio, fechaFinalizacion, contenido, estado, destacado, principal,id_categoria_personal,id_categoria_transparente]], function (err, resultUpdate) {
        if (err) return res.status(500).send(err.sqlMessage);

        connection.query("DELETE FROM tags WHERE id_noticia = ?", [idNoticia], function (err, resultDelete) {
          if (tags.length > 0) {
            recorrerArrayTags(0, tags, idNoticia, function (err, result) {

            });
          }
        })



        res.json({ success: 1, resultUpdate });



      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.post('/update-mi-videoteca', bodyJson, general.isLoggedIn, function (req, res) {
    let idNoticia = req.body.id || null;

    let nombre = req.body.nombre || null;
    let descripcion = req.body.descripcion || null;
    let idTipoNoticia = req.body.idTipoNoticia || null;
    let idUser = (req.user && req.user.id) || null;
    let idUserType = (req.user && req.user.id_users_type) || null;
    let fechaInicio = req.body.fechaInicio || null;
    let fechaFinalizacion = req.body.fechaFinalizacion || null;
    let contenido = req.body.contenido || null;
    let estado = req.body.estado || null;
    let idTipoCategoria = req.body.idTipoCategoria || null;
    let destacado = req.body.destacado || null;
    let principal = req.body.principal || null;
    let id_categoria_personal = req.body.idCategoriaPersonal || null;
    let id_categoria_transparente = req.body.idCategoriaTransparente || null;


    let tags = req.body.tags || [];
    try {

      connection.query("SELECT * FROM noticias n LEFT JOIN users u ON u.id = n.id_user WHERE n.id = ? AND u.id_users_type = ?", [idNoticia, idUserType], function (err, resultSelect) {

        if (!resultSelect.length)
          return res.status(500).send("no esta autorizado para modificar la noticia");


        connection.query("CALL noticias_update(?)", [[idNoticia, nombre, descripcion, idTipoNoticia, idTipoCategoria, fechaInicio, fechaFinalizacion, contenido, estado, destacado, principal,id_categoria_personal,id_categoria_transparente]], function (err, resultUpdate) {
          if (err) return res.status(500).send(err.sqlMessage);

          connection.query("DELETE FROM tags WHERE id_noticia = ?", [idNoticia], function (err, resultDelete) {
            if (tags.length > 0) {
              recorrerArrayTags(0, tags, idNoticia, function (err, result) {

              });
            }
          })



          res.json({ success: 1, resultUpdate });



        })

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });



  app.post('/delete-mi-videoteca', bodyJson, general.isLoggedIn, function (req, res) {
    let idUser = (req.user && req.user.id) || null;
    try {
      connection.query("CALL mi_videoteca_delete(?)", [[req.body.id, idUser]], function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);

        res.json({ success: 1, result });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.post('/delete-videoteca', bodyJson, general.isLoggedIn, function (req, res) {
    let idUser = (req.user && req.user.id) || null;
    try {
      connection.query("CALL videoteca_delete(?)", [[req.body.id]], function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);

        res.json({ success: 1, result });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.post('/insert-videoteca-image', bodyJson, general.isLoggedIn, function (req, res) {
    let extension = req.body.extension || null;
    try {
      connection.query("CALL videoteca_insert_image(?)", [[extension]], function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  
  

  


  function checkConnection(req, res, next) {
    console.log(connection.state);
    //  connection = mysql.createConnection(dbconfig.connection);



    next();

  }


}
