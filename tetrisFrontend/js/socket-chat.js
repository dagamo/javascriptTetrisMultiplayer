var socket = io('http://localhost:3000');

var params = new URLSearchParams(window.location.search);
console.log('Params', params);
if (!params.has('nombre')) {
	window.location = 'index.html';
	throw new Error('El nombre y sala son necesarios');
}
console.log('Nombre', params.get('nombre'));
var usuario = {
	nombre: params.get('nombre')
};

socket.on('connect', function() {
	console.log('Conectado al servidor');

	socket.emit('enterGame', usuario, function(resp) {
		console.log('Usuarios conectados', resp);
		renderizarUsuarios(resp);
	});
});

// escuchar
socket.on('disconnect', function() {
	console.log('Perdimos conexión con el servidor');
});

// Enviar información
// socket.emit('crearMensaje', {
//     nombre: 'Fernando',
//     mensaje: 'Hola Mundo'
// }, function(resp) {
//     console.log('respuesta server: ', resp);
// });

// Escuchar información
socket.on('crearMensaje', function(mensaje) {
	// console.log('Servidor:', mensaje);
	renderizarMensajes(mensaje, false);
	scrollBottom();
});

// Escuchar cambios de usuarios
// cuando un usuario entra o sale del chat
socket.on('listaPersona', function(personas) {
	renderizarUsuarios(personas);
});

// Mensajes privados
socket.on('mensajePrivado', function(mensaje) {
	console.log('Mensaje Privado:', mensaje);
});
