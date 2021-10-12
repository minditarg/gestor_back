
var bodyParser = require('body-parser');

var bodyJson = bodyParser.json()


module.exports = function (app, connection, passport) {


    app.get('/list-pages/:idPage', function (req, res) {
        let idPage = parseInt(req.params.idPage);
        try {
          connection.query("CALL pages_detail(?)",[[idPage]], function (err, result) {
            if (err) return res.status(500).send(err);
            
            res.json({ success: 1, result:result[0] });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });

      app.get('/list-page-front/:idPage', function (req, res) {
        let idPage = parseInt(req.params.idPage);
        try {
          connection.query("CALL pages_front(?)",[[idPage]], function (err, result) {
            if (err) return res.status(500).send(err);
            
            res.json({ success: 1, page:result[0],modules:result[1] });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });

    app.get('/list-pages/tipo/:tipoPage', function (req, res) {
        let tipoPage = req.params.tipoPage;
        console.log(tipoPage);
        try {
          connection.query("CALL pages_list(?)",[[tipoPage]], function (err, result) {
            if (err) return res.status(500).send(err);
            
            res.json({ success: 1, result:result[0] });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });


      app.post('/insert-page',bodyJson, function (req, res) {

        try {
          connection.query("CALL pages_insert(?)",[[req.body.nombre,req.body.descripcion,req.body.uri]], function (err, result) {
            if (err) return res.status(500).send(err.sqlMessage);
            
            res.json({ success: 1, result });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });

      app.post('/update-page',bodyJson, function (req, res) {

        try {
          connection.query("CALL pages_update(?)",[[req.body.id,req.body.nombre,req.body.descripcion,req.body.uri]], function (err, result) {
            if (err) return res.status(500).send(err.sqlMessage);
            
            res.json({ success: 1, result });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });


      app.post('/delete-page',bodyJson, function (req, res) {

        try {
          connection.query("CALL pages_delete(?)",[[req.body.id]], function (err, result) {
            if (err) return res.status(500).send(err.sqlMessage);
            
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
