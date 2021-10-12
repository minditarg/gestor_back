var bodyParser = require('body-parser');

var bodyJson = bodyParser.json()


module.exports = function (app, connection, passport) {


    app.get('/list-items/:idItem', function (req, res) {
        let idItem = parseInt(req.params.idItem);
        try {
            connection.query("CALL items_detail(?)", [[idItem]], function (err, result) {
                if (err) return res.status(500).send(err);

                res.json({ success: 1, result: result[0] });

            })
        } catch (e) {
            return res.status(500).send(e.message)
        }

    });

    app.get('/list-items', function (req, res) {

        try {
            connection.query("CALL items_list()", function (err, result) {
                if (err) return res.status(500).send(err);

                res.json({ success: 1, result: result[0] });

            })
        } catch (e) {
            return res.status(500).send(e.message)
        }

    });

    app.get('/list-items-children/:idItem', function (req, res) {
        let idItem = req.params.idItem || null;
        console.log(idItem);
        try {
            connection.query("CALL items_list_children(?)",[[idItem]], function (err, result) {
                if (err) return res.status(500).send(err);

                res.json({ success: 1, result: result[0] });

            })
        } catch (e) {
            return res.status(500).send(e.message)
        }

    });

    app.post('/order-items', bodyJson, function (req, res) {
        let arrayOrder = req.body.arrayOrder;

        if (arrayOrder.length > 0) {
            recorrerArrayOrder(0, arrayOrder, function (result) {
                res.json({ success: 1, result });

            })
        }

    });

    function recorrerArrayOrder(index, arrayOrder, callback) {
        try {
            connection.query("CALL items_order(?)", [[arrayOrder[index], index]], function (err, result) {
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


    app.post('/insert-item', bodyJson, function (req, res) {

        try {
            connection.query("CALL items_insert(?)", [[req.body.texto, req.body.enlace, req.body.id_page,req.body.id_item_menu]], function (err, result) {
                if (err) return res.status(500).send(err.sqlMessage);

                res.json({ success: 1, result });

            })
        } catch (e) {
            return res.status(500).send(e.message)
        }

    });

    app.post('/update-item', bodyJson, function (req, res) {
        try {
            connection.query("CALL items_update(?)", [[req.body.id, req.body.texto, req.body.enlace, req.body.id_page, req.body.estado]], function (err, result) {
                if (err) return res.status(500).send(err.sqlMessage);

                res.json({ success: 1, result });

            })
        } catch (e) {
            return res.status(500).send(e.message)
        }

    });


    app.post('/delete-item', bodyJson, function (req, res) {

        try {
            connection.query("CALL items_delete(?)", [[req.body.id]], function (err, result) {
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