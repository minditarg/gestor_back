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
    /*TIPOS DE FALTAS*/
    /********************************* */

    app.get('/list-tiposfaltas', isLoggedIn, checkConnection, function (req, res) {
        connection.query("SELECT * FROM tipos_faltas WHERE estado = 1", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-tiposfaltas', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [92], connection) }, function (req, res) {
		var arrayIns = [req.body.descripcion, req.body.cantidad_dias, 1];
		connection.query("CALL tiposfaltas_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.post('/delete-tipofalta', bodyJson, checkConnection, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE tipos_faltas SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla tipos de faltas", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla tipos de faltas no esta ingresado" })

		}
	});

    app.get('/list-tiposfaltas/:id', checkConnection, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM tipos_faltas WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-tipofalta', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [92], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let descripcion = req.body.descripcion || null;
            let cantidad_dias = req.body.cantidad_dias || null;

			let arrayIns = [id, descripcion, cantidad_dias];
			connection.query("CALL tiposfaltas_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de tipos de faltas no esta ingresado" })

		}
	});

    /********************************* */
    /*EMPLEADOS*/
    /********************************* */

    app.get('/list-empleados', isLoggedIn, checkConnection, function (req, res) {
        connection.query("SELECT e.*, te.descripcion as 'tipoempleado' FROM empleados e INNER JOIN tipos_empleados te ON e.id_tipo_empleado = te.id WHERE e.estado = 1 order by e.apellido, e.nombre", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-empleados', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [91], connection) }, function (req, res) {
		let id_tipo_empleado = req.body.id_tipo_empleado || null;
        var arrayIns = [req.body.nombre, req.body.apellido, req.body.dni, req.body.telefono, req.body.direccion, id_tipo_empleado, req.body.mail, 1];
		connection.query("CALL empleados_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.post('/delete-empleado', bodyJson, checkConnection, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE empleados SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de empleados", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla empleados no esta ingresado" })

		}
	});

    app.get('/list-empleados/:id', checkConnection, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM empleados WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-empleado', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [91], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let nombre = req.body.nombre || null;
            let apellido = req.body.apellido || null;
            let dni = req.body.dni || null;
            let telefono = req.body.telefono || null;
            let direccion = req.body.direccion || null;
            let id_tipo_empleado = req.body.id_tipo_empleado || null;
            let mail = req.body.mail || null;

			let arrayIns = [id, nombre, apellido, dni, telefono, direccion, id_tipo_empleado, mail];
			connection.query("CALL empleados_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de empleados no esta ingresado" })

		}
	});

    app.get('/list-tipo-empleado', checkConnection, function (req, res) {

		connection.query("SELECT * FROM tipos_empleados WHERE estado = 1", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

    /********************************* */
    /*CONTROL DE FALTAS*/
    /********************************* */

    app.get('/list-controlfaltas', isLoggedIn, checkConnection, function (req, res) {
        //connection.query("SELECT * FROM control_faltas WHERE estado = 1", function (err, result) {
        connection.query("CALL control_faltas_listar()", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-controlfaltas', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [91], connection) }, function (req, res) {
		let id_empleado = req.body.id_empleado || null;
		let id_tipo_falta = req.body.id_tipo_falta || null;
        var arrayIns = [id_empleado, id_tipo_falta, req.body.inicio_licencia, req.body.fin_licencia, 1];
		connection.query("CALL control_faltas_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.post('/delete-controlfalta', bodyJson, checkConnection, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE control_faltas SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de control de faltas", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla control de faltas no esta ingresado" })

		}
	});

    app.get('/list-controlfaltas/:id', checkConnection, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM control_faltas WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-controlfalta', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [91], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let id_empleado = req.body.id_empleado || null;
			let id_tipo_falta = req.body.id_tipo_falta || null;

			let arrayIns = [id, id_empleado, id_tipo_falta, req.body.inicio_licencia, req.body.fin_licencia];
			connection.query("CALL control_faltas_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de empleados no esta ingresado" })

		}
	});

    app.get('/list-empleado', checkConnection, function (req, res) {

		connection.query("SELECT * FROM empleados WHERE estado = 1 order by apellido, nombre", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

    app.get('/list-tipo-falta', checkConnection, function (req, res) {

		connection.query("SELECT * FROM tipos_faltas WHERE estado = 1", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.post('/insert-archivo/:id/:nombre_foto', function (req, res) {

		var id = req.params.id;
		var nombre_foto = req.params.nombre_foto;

		var multer = require('multer');
		var storage = multer.diskStorage({
			destination: function (req, file, callback) {

				callback(null, './' + process.env.UPLOAD_PATH + '/archivos/archivo/' + id);
			},
			filename: function (req, file, callback) {
				console.log(file);
				callback(null, file.originalname);
			}
		});
		var upload = multer({ storage: storage }).single('archivo');

		console.log(req);
		mkdirp.sync(path.join(__dirname, '../' + process.env.UPLOAD_PATH + '/archivos/archivo/' + id));


		upload(req, res, function (err) {
			if (err) return res.status(500).send(err);


			if (req.params.id) {
				var id = parseInt(req.params.id);
				var objectoUpdate = { archivo: path.join('/' + process.env.UPLOAD_PATH + '/archivos/archivo/' + id + "/" + nombre_foto) };
				connection.query("UPDATE control_faltas SET ? where id = ?", [objectoUpdate, id], function (err, result) {

					if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar modificar los datos de la operacion", err });
					res.json({ success: 1, result });
				})
			} else {
				res.json({ success: 0, error_msj: "el id de la tabla operaciones no esta ingresado" })
			}

		});


	});

	app.post('/delete-archivo', bodyJson, checkConnection, function (req, res) {

		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { archivo: null };
			connection.query("UPDATE control_faltas SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de operaciones", err });
				res.json({ success: 1, result });
			});
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de operaciones no esta ingresado" })
		}
	});

	/********************************* */
    /*COMPENSATORIOS*/
    /********************************* */

    app.get('/list-compensatorios', isLoggedIn, checkConnection, function (req, res) {

        connection.query("CALL compensatorios_listar()", function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

    app.post('/insert-compensatorios', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [91], connection) }, function (req, res) {
		let id_empleado = req.body.id_empleado || null;
		let horas = req.body.horas || 0;
		let minutos = req.body.minutos || 0;
        var arrayIns = [id_empleado, horas, minutos, req.body.fecha, 1];
		connection.query("CALL compensatorios_insertar(?)",  [arrayIns], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err.message, err });
			res.json({ success: 1, result });
		})
	});

    app.post('/delete-compensatorio', bodyJson, checkConnection, function (req, res) {
		if (req.body.id) {
			var id = parseInt(req.body.id);
			var objectoUpdate = { estado: 0 };
			connection.query("UPDATE compensatorios SET ? where id = ?", [objectoUpdate, id], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: "ha ocurrido un error al intentar actualizar la tabla de empleados", err });
				res.json({ success: 1, result });
			});

		} else {
			res.json({ success: 0, error_msj: "el id de la tabla empleados no esta ingresado" })

		}
	});

    app.get('/list-compensatorios/:id', checkConnection, function (req, res) {
		var id = req.params.id;
		connection.query("SELECT * FROM compensatorios WHERE id = ? AND estado > 0", [id], function (err, result) {
			if (err) return res.json({ success: 0, error_msj: err });
			res.json({ success: 1, result });
		});
	});

	app.post('/update-compensatorio', bodyJson, checkConnection, (req, res, next) => { general.checkPermission(req, res, next, [91], connection) }, function (req, res) {
		if (req.body.id) {
			let id = req.body.id || null;
			let id_empleado = req.body.id_empleado || null;
            let horas = req.body.horas || 0;
            let minutos = req.body.minutos || 0;

			let arrayIns = [id, id_empleado, horas, minutos, req.body.fecha];
			connection.query("CALL compensatorios_update(?)",  [arrayIns], function (err, result) {
				if (err) return res.json({ success: 0, error_msj: err.message, err });
				res.json({ success: 1, result });
			})
		} else {
			res.json({ success: 0, error_msj: "el id de la tabla de compensatorios no esta ingresado" })

		}
	});

	/********************************* */
    /*COMPENSATORIOS/FALTAS EMPLEADOS*/
    /********************************* */

	app.get('/list-compensatorios-empleados', isLoggedIn, checkConnection, function (req, res) {

		let idUser = (req.user && req.user.id) || null;
		var arrayIns = [idUser];
        connection.query("CALL compensatorios_empleados_listar(?)", [arrayIns], function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

	app.get('/list-controlfaltas-empleados', isLoggedIn, checkConnection, function (req, res) {
        
		let idUser = (req.user && req.user.id) || null;
		var arrayIns = [idUser];
        connection.query("CALL control_faltas_empleados_listar(?)", [arrayIns], function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });
	
	app.get('/list-faltas-empleados', isLoggedIn, checkConnection, function (req, res) {
        
        connection.query("CALL faltas_por_empleados_listar()", [], function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

	app.get('/list-compensatorios-gestion', isLoggedIn, checkConnection, function (req, res) {
        
        connection.query("CALL list_compensatorios_empleados_gestion()", [], function (err, result) {
            if (err) return res.json({ success: 0, error_msj: err });
            res.json({ success: 1, result });
        });
    });

	/********************************* */
    /*        EMPLEADOS USERS          */
    /********************************* */

	app.get('/list-empleado-user', checkConnection, function (req, res) {

		connection.query("SELECT e.* FROM empleados e LEFT JOIN users u ON u.id_empleado = e.id WHERE u.id_empleado IS NULL AND e.estado = 1 ORDER BY e.apellido, e.nombre", function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

	app.get('/list-empleado-edit-user/:iduser', checkConnection, function (req, res) {

		var iduser = req.params.iduser;
		connection.query("CALL edit_user_empleados_listar(?)", [iduser], function (err, result) {
			if (err) {
				return res.json({ success: 0, error_msj: err });
			}
			else {

				res.json({ success: 1, result });
			}
		})
	});

}