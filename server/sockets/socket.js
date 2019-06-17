const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');

const GENERAL_SALA = 'GENERAL_SALA';
const usuarios = new Usuarios();

io.on('connection', (client) => {
	client.on('enterGame', (data, callback) => {
		console.log('Entro en esta conexion', client.id);

		if (!data.nombre) {
			return callback({
				error: true,
				mensaje: 'El nombre es necesario'
			});
		}

		client.join(GENERAL_SALA);
		usuarios.agregarPersona(client.id, data.nombre);

		client.broadcast.to(GENERAL_SALA).emit('listaPersona', usuarios.getPersonasAvailable());
		client.broadcast.to(GENERAL_SALA).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} se unió`));

		callback(usuarios.getPersonasAvailable());
	});

	client.on('crearMensaje', (data, callback) => {
		let persona = usuarios.getPersona(client.id);

		let mensaje = crearMensaje(persona.nombre, data.mensaje);
		client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

		callback(mensaje);
	});

	client.on('disconnect', () => {
		let personaBorrada = usuarios.borrarPersona(client.id);

		client.broadcast
			.to(GENERAL_SALA)
			.emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} salió`));
		client.broadcast.to(GENERAL_SALA).emit('listaPersona', usuarios.getPersonasAvailable());
	});

	// Mensajes privados
	client.on('mensajePrivado', (data) => {
		let persona = usuarios.getPersona(client.id);
		client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
	});
});
