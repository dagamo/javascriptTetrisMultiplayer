const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje, createInvitation } = require('../utilidades/utilidades');

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

		client.broadcast.to(GENERAL_SALA).emit('listaPersona', usuarios.getPersonasAvailable(data.nombre));
		client.broadcast.to(GENERAL_SALA).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} se unió`));

		callback(usuarios.getPersonasAvailable());
	});
	//Invitation socket
	client.on('sendInvitation', ({ nombre, id }, callback) => {
		try {
			client.broadcast.to(id).emit('invitationRequest', createInvitation(nombre, client.id, id));
			callback({ message: 'Se ha enviado la invitacion correctamente ' });
		} catch (e) {
			callback(e);
		}
	});

	//Invitation Response
	client.on('responseInvitation', ({ accept, id }, callback) => {
		let persona = usuarios.getPersona(id);
		try {
			client.broadcast.to(id).emit('responseInvitation', { accept, nombre: persona.nombre, idSala: id });
			callback({ message: 'Se ha enviado la respuesta satisfactoriamente222', id });
		} catch (e) {
			callback(e);
		}
	});
	//Create the sala game
	client.on('joinGame', ({ idSala }, callback) => {
		usuarios.agregarOponente(idSala);
		client.join(`sala-${idSala}`);
		client.broadcast
			.to(`sala-${idSala}`)
			.emit('welcomeGame', { message: 'Bienvenido al juego', sala: `sala-${idSala}` });

		callback({ message: 'Te has unido a la sala de juego', sala: `sala-${idSala}` });
	});

	//Create the sala game
	client.on('pruebaSocket', ({ idSala }, callback) => {
		client.broadcast
			.to(`sala-${idSala}`)
			.emit('welcomeGame', { message: 'Bienvenido al juego', sala: `sala-${idSala}` });

		callback({ message: 'Te has unido a la sala de juego', sala: `sala-${idSala}` });
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
