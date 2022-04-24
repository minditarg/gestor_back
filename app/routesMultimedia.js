
var bodyParser = require('body-parser');
var mkdirp = require('mkdirp');
var formidableMiddleware = require('express-formidable');
var fs = require('fs');
var path = require('path');
var bodyJson = bodyParser.json();
const imageThumbnail = require('image-thumbnail');
var bodyUrlencoded = bodyParser.urlencoded(
  { extended: true }

);
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if(req.body.module_id)
      mkdirp.sync(path.join(__dirname, '../' + process.env.UPLOAD_PATH + '/modules/' + req.body.module_id + '/thumbs'));

    callback(null, './' + process.env.UPLOAD_PATH + '/' + (req.body.module_id ? 'modules/' + req.body.module_id + '/' : '')  );
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
//var upload = multer({dest:'uploads/'});
var upload = multer({ storage: storage }).single('userPhoto');


var storageNoticia = multer.diskStorage({
  destination: function (req, file, callback) {
    let { id_noticia } = req.body;
    if(id_noticia){
      mkdirp.sync(path.join(__dirname, '../' + process.env.UPLOAD_PATH + '/noti/' + id_noticia));
      callback(null, './' + process.env.UPLOAD_PATH + '/noti/' + id_noticia);
    }
    else {
      callback("No se encuentra el id de la noticia",false);
    }  
    
  },
  filename: function (req, file, callback) {
    let regular1 = /[\s]/gi; //selecciona los espacios
    let regular2 = /[^a-z0-9_.-]/gi //selecciona los caracteres que no son ni letras números  _-.

    let nombre = file.originalname;

    nombre = nombre.replace(regular1,"_").replace(regular2,"");
    callback(null, nombre);
  }
});
//var upload = multer({dest:'uploads/'});
var uploadNoticia = multer({ storage: storageNoticia ,
}).single('userFile');

module.exports = function (app, connection, passport) {


  app.get('/list-files/:idFile', function (req, res) {
    let idPage = parseInt(req.params.idPage);
    try {
      connection.query("CALL files_detail(?)", [[idFile]], function (err, result) {
        if (err) return res.status(500).send(err);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });

  app.post('/list-files', function (req, res) {

    try {
      connection.query("CALL files_list()", function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);

        res.json({ success: 1, result: result[0] });

      })
    } catch (e) {
      return res.status(500).send(e.message)
    }

  });


  app.post('/insert-file', function (req, res) {
    mkdirp.sync(path.join(__dirname, '../' + process.env.UPLOAD_PATH + '/thumbs'));


    upload(req, res, function (err) {
      if (err) return res.status(500).send(err);

      if (req.file.mimetype.indexOf('image') > -1) {
        imageThumbnail('./' + process.env.UPLOAD_PATH + '/' + req.file.filename, { width: 300, height: 300 }
        )
          .then(thumbnail => {

            fs.writeFile('./' + process.env.UPLOAD_PATH + '/thumbs/thumb_300x300' + req.file.filename, thumbnail, function (err) {
            })

          })
          .catch(err => console.error(err));

        imageThumbnail('./' + process.env.UPLOAD_PATH + '/' + req.file.filename, { width: 100, height: 100 }
        )
          .then(thumbnail => {

            fs.writeFile('./' + process.env.UPLOAD_PATH + '/thumbs/thumb_100x100' + req.file.filename, thumbnail, function (err) {
            })

          })
          .catch(err => console.error(err));


      }


      let type_file;
      if (req.file.mimetype.indexOf('image') > -1)
        type_file = 1
      else
        type_file = 2;

      connection.query("CALL files_insert(?)", [[req.file.filename, type_file]], function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);

        res.json({ success: 1, file: req.file });

      })



    });



  });

  app.post('/insert-only-file', function (req, res) {
    mkdirp.sync(path.join(__dirname, '../' + process.env.UPLOAD_PATH + '/thumbs'));


    upload(req, res, async function (err) {
      if (err) return res.status(500).send(err);


      if (req.file.mimetype.indexOf('image') > -1) {
        try {
          let thumbnail = await imageThumbnail('./' + process.env.UPLOAD_PATH + '/' + (req.body.module_id ? 'modules/' + req.body.module_id + '/' : '' ) + req.file.filename, { percentage: 25 });
          fs.writeFileSync('./' + process.env.UPLOAD_PATH + (req.body.module_id ? '/modules/' + req.body.module_id  : '' ) + '/thumbs/' + req.file.filename, thumbnail);

          if (req.body.thumbs) {


            let thumbs = JSON.parse(req.body.thumbs);
            thumbs.forEach(async elem => {
              let thumbnail = await imageThumbnail('./' + process.env.UPLOAD_PATH + '/' + req.file.filename, { width: elem.width, height: elem.height });

              mkdirp.sync(path.join(__dirname, '../' + process.env.UPLOAD_PATH + '/' + elem.width + 'x' + elem.height));

              fs.writeFileSync('./' + process.env.UPLOAD_PATH + '/' + elem.width + 'x' + elem.height + '/' + req.file.filename, thumbnail);
            })

            res.json({ success: 1, file: req.file });


          } else {
            res.json({ success: 1, file: req.file });
          }
        } catch (err) {
          res.status(500).send(err);
        }

      } else {

        res.json({ success: 1, file: req.file });
      }




    });



  });



  app.post('/insert-noticia-file', function (req, res) {

    
    uploadNoticia(req, res,function (err) {
      if (err) return res.status(500).send(err);

      if(!req.file) return res.status(500).send("no se ha pasado el archivo");

          let type_file;
          if (req.file.mimetype.indexOf('image') > -1)
            type_file = 1
          else
            type_file = 2;
    
          connection.query("CALL files_insert(?)", [[req.file.filename, type_file]], function (err, result) {
            if (err) return res.status(500).send(err.sqlMessage);
    
            res.json({ success: 1, file: req.file });
    
          })
         

    });



  });


  app.post('/delete-file', bodyJson, function (req, res) {

    try {
      connection.query("CALL files_delete(?)", [[req.body.id]], function (err, result) {
        if (err) return res.status(500).send(err.sqlMessage);


        console.log(result[0][0].nombre);
        fs.rename('./uploads/' + result[0][0].nombre, './uploads/deleted_' + result[0][0].nombre, function () { })
        fs.rename('./uploads/thumbs/thumb_' + result[0][0].nombre, './uploads/thumbs/deleted_thumb_' + result[0][0].nombre, function () { })


        res.json({ success: 1, result });

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
