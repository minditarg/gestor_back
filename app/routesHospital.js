var general = require('./functionsGeneral');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var mkdirp = require('mkdirp');
var path = require('path');
var bodyUrlencoded = bodyParser.urlencoded({
 	extended: true
});
var bodyJson = bodyParser.json();
var bcrypt = require('bcrypt-nodejs');


module.exports = function (app,connection, passport) {

    function checkConnection(req, res, next) {
		console.log(connection.state);
		//connection = mysql.createConnection(dbconfig.connection);
		next();
	}

	function isLoggedIn(req, res, next) {
		// if user is authenticated in the session, carry on
		if (req.isAuthenticated())
			return next();
		// if they aren't redirect them to the home page
		res.json({ success: 3, error_msj: "no esta autenticado" });
	}

    /********************************* */
    /*CLIENTES*/
    /********************************* */

    app.get('/list-clientes', isLoggedIn, checkConnection, function (req, res) {
        connection.query("SELECT c.*, tc.descripcion as 'tipocliente' FROM clientes c INNER JOIN tipos_clientes tc ON c.id_tipo_cliente = tc.id WHERE c.estado = 1 order by c.apellido, c.nombre", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-clientes', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [91], connection) }, function (req, res) {
		let id_tipo_cliente = req.body.id_tipo_cliente || null;
        var arrayIns = [req.body.nombre, req.body.apellido, req.body.dni, req.body.telefono, req.body.direccion, id_tipo_cliente, req.body.mail, 1];
		connection.query("CALL clientes_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.get('/list-tipo-cliente', checkConnection, function (req, res) {

		connection.query("SELECT * FROM tipos_clientes WHERE estado = 1", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

    app.get('/list-clientes/:id', checkConnection, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM clientes WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-cliente', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [91], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let nombre = req.body.nombre || null;
            let apellido = req.body.apellido || null;
            let dni = req.body.dni || null;
            let telefono = req.body.telefono || null;
            let direccion = req.body.direccion || null;
            let id_tipo_cliente = req.body.id_tipo_cliente || null;
            let mail = req.body.mail || null;

			let arrayIns = [id, nombre, apellido, dni, telefono, direccion, id_tipo_cliente, mail];
			connection.query("CALL clientes_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de clientes no esta ingresado" })

		}
	});

    app.post('/delete-cliente', bodyJson, checkConnection, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE clientes SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de clientes", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla clientes no esta ingresado" })

		}
	});

	/********************************* */
    /*PACIENTES*/
    /********************************* */

    app.get('/list-pacientes', isLoggedIn, checkConnection, function (req, res) {
        connection.query("CALL pacientes_listar()", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
			
        });
    });

    app.post('/insert-pacientes', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [91], connection) }, function (req, res) {
		let id_cliente = req.body.id_cliente || null;
		let id_clase = req.body.id_clase || null;
		let id_especie = req.body.id_especie || null;
		let id_raza = req.body.id_raza || null;
		let id_sexo = req.body.id_sexo || null;
        var arrayIns = [req.body.nombre, id_cliente, id_clase, id_especie, id_raza,  req.body.color, id_sexo, req.body.castrado, req.body.notas, req.body.fecha_nacimiento, req.body.fecha_adopcion, 1];
		connection.query("CALL pacientes_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.get('/list-cliente', checkConnection, function (req, res) {

		connection.query("SELECT * FROM clientes WHERE estado = 1 ORDER BY APELLIDO, NOMBRE", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-clase', checkConnection, function (req, res) {

		connection.query("SELECT * FROM clases WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-especie', checkConnection, function (req, res) {

		connection.query("SELECT * FROM especies WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-raza', checkConnection, function (req, res) {

		connection.query("SELECT * FROM razas WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-sexo', checkConnection, function (req, res) {

		connection.query("SELECT * FROM sexos WHERE estado = 1 ORDER BY DESCRIPCION", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

    app.get('/list-pacientes/:id', checkConnection, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM pacientes WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-paciente', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [102], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let nombre = req.body.nombre || null;
			let id_cliente = req.body.id_cliente || null;
			let id_clase = req.body.id_clase || null;
			let id_especie = req.body.id_especie || null;
			let id_raza = req.body.id_raza || null;
			let color = req.body.color || null;
			let id_sexo = req.body.id_sexo || null;
			let castrado = req.body.castrado || null;
			let notas = req.body.notas || null; 
			let fecha_nacimiento = req.body.fecha_nacimiento || null; 
			let fecha_adopcion = req.body.fecha_adopcion || null;

			let arrayIns = [id, nombre, id_cliente, id_clase, id_especie, id_raza, color, id_sexo, castrado, notas, fecha_nacimiento, fecha_adopcion];
			connection.query("CALL pacientes_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de pacientes no esta ingresado" })

		}
	});

    app.post('/delete-paciente', bodyJson, checkConnection, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE pacientes SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de clientes", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla clientes no esta ingresado" })

		}
	});

}