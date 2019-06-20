const crearMensaje = (nombre, mensaje) => {
	return {
		nombre,
		mensaje,
		fecha: new Date().getTime()
	};
};

const createInvitation = (nombre, id, idSala) => {
	return {
		nombre,
		id,
		idSala,
		fecha: new Date().getTime()
	};
};
module.exports = {
	crearMensaje,
	createInvitation
};
