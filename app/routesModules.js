
var bodyParser = require('body-parser');

var bodyJson = bodyParser.json()


module.exports = function (app, connection, passport) {


    app.get('/list-modules/:idModule', function (req, res) {
        let idModule = parseInt(req.params.idModule);
        try {
          connection.query("CALL modules_detail(?)",[[idModule]], function (err, result) {
            if (err) return res.status(500).send(err);
            
            res.json({ success: 1, result:result[0] });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });

    app.get('/list-modules', function (req, res) {

        try {
          connection.query("CALL modules_list", function (err, result) {
            if (err) return res.status(500).send(err);
            
            res.json({ success: 1, result:result[0] });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });

      app.get('/list-modules-bypage/:idPage', function (req, res) {
        let idPage = parseInt(req.params.idPage);
        try {
          connection.query("CALL modules_detail_bypage(?)",[[idPage]], function (err, result) {
            if (err) return res.status(500).send(err);
            
            res.json({ success: 1, result:result[0] });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });


      app.post('/insert-module',bodyJson, function (req, res) {

        try {
          connection.query("CALL modules_insert(?)",[[req.body.nombre,req.body.id_page,req.body.id_type_module]], function (err, result) {
            if (err) return res.status(500).send(err.sqlMessage);
            
            res.json({ success: 1, result });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });

      app.post('/update-module',bodyJson, function (req, res) {

        try {
          connection.query("CALL modules_update(?)",[[req.body.id,req.body.nombre,req.body.id_page,req.body.id_type_module,req.body.contenido,req.body.estado, req.body.columnas]], function (err, result) {
            if (err) return res.status(500).send(err.sqlMessage);
            
            res.json({ success: 1, result });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });

      app.post('/order-modules', bodyJson, function (req, res) {
        let arrayOrder = req.body.arrayOrder;

        if (arrayOrder.length > 0) {
            recorrerArrayOrder(0, arrayOrder, function (result) {
                res.json({ success: 1, result });

            })
        }

    });

    function recorrerArrayOrder(index, arrayOrder, callback) {
        try {
            connection.query("CALL modules_order(?)", [[arrayOrder[index], index]], function (err, result) {
                if (err) return res.status(500).send(err);

                if (arrayOrder.length > index + 1)
                    recorrerArrayOrder(index + 1, arrayOrder, callback)
                else
                    callback(result);

            })
        } catch (e) {
            return res.status(500).send(e.message)
        }



    }


      app.post('/delete-module',bodyJson, function (req, res) {

        try {
          connection.query("CALL modules_delete(?)",[[req.body.id]], function (err, result) {
            if (err) return res.status(500).send(err.sqlMessage);
            
            res.json({ success: 1, result });
    
          })
        } catch (e) {
          return res.status(500).send(e.message)
        }
    
      });


      app.get('/list-types-modules', function (req, res) {

        try {
          connection.query("CALL types_modules_list", function (err, result) {
            if (err) return res.status(500).send(err);
            
            res.json({ success: 1, result:result[0] });
    
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
