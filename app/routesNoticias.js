
var bodyParser = require('body-parser');

var bodyJson = bodyParser.json()


module.exports = function (app, connection, passport) {


  app.get('/list-noticias/:idNoticia', function (req, res) {
    let idNoticia = parseInt(req.params.idNoticia);
    try {
      connection.query("CALL noticias_detail(?)", [[idNoticia]], function (err, result) {
        if (err) return res.status(500).send(err);
        res.json({ success: 1, noticia: result[0], tags: result[1] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.get('/list-noticias', function (req, res) {

    try {
      connection.query("CALL noticias_list", function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.get('/list-noticias-bytipo/:idTipoNoticia', function (req, res) {

    let idTipoNoticia = parseInt(req.params.idTipoNoticia);

    try {
      connection.query("CALL noticias_list_bytipo(?)", [idTipoNoticia], function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.post('/insert-noticia', bodyJson, function (req, res) {
    let nombre = req.body.nombre || null;
    let descripcion = req.body.descripcion || null;
    let idTipoNoticia = req.body.idTipoNoticia || null;
    let idCategoria = req.body.idCategoria || null;
    let idUser = (req.user && req.user.id) || null;
    let fechaFinalizacion = req.body.fechaFinalizacion || null;
    let contenido = req.body.contenido || null;
    let estado = req.body.estado || null;

    let tags = req.body.tags || [];


    try {
      connection.query("CALL noticias_insert(?)", [[nombre, descripcion, idTipoNoticia, idCategoria, idUser, fechaFinalizacion, contenido, estado]], function (err, resultInsert) {
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


  app.post('/update-noticia', bodyJson, function (req, res) {
    let idNoticia = req.body.id || null;

    let nombre = req.body.nombre || null;
    let descripcion = req.body.descripcion || null;
    let idTipoNoticia = req.body.idTipoNoticia || null;
    let idCategoria = req.body.idCategoria || null;
    let idUser = (req.user && req.user.id) || null;
    let fechaFinalizacion = req.body.fechaFinalizacion || null;
    let contenido = req.body.contenido || null;
    let estado = req.body.estado || null;

    let tags = req.body.tags || [];
    try {
      connection.query("CALL noticias_update(?)", [[idNoticia, nombre, descripcion, idTipoNoticia, idCategoria, idUser, fechaFinalizacion, contenido, estado]], function (err, resultUpdate) {
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




  app.post('/delete-noticia', bodyJson, function (req, res) {

    try {
      connection.query("CALL noticias_delete(?)", [[req.body.id]], function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);

        res.json({ success: 1, result });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.post('/insert-noticia-image', bodyJson, function (req, res) {
    let extension = req.body.extension || null;
    try {
      connection.query("CALL noticias_insert_image(?)", [[extension]], function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);

        res.json({ success: 1, result:result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.get('/list-types-noticias', function (req, res) {

    try {
      connection.query("CALL noticias_tipos_list", function (err, result) {
        if (err) return res.status(500).send(err);

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
