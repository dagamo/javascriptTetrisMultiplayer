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
// on a Invitation
socket.on('invitationRequest', function({ nombre, idSala, id }) {
	renderModal('modalInvitation', {
		id: idSala,
		oponenteID: id,
		name: 'textoModal',
		description: `${nombre} te esta invitando a jugar`
	});
});
// Invitation response
socket.on('responseInvitation', function({ accept, nombre, idSala }) {
	if (!accept) {
		hideModal('modalTwo');
		renderModal('modalInvitation', { name: 'textoModal', description: `${nombre} no ha aceptado tu invitacioon` });
	}
	else {
		salaBoard = idSala;
		socket.emit('joinGame', { idSala, myID: idSala }, (resp) => {
			console.log(resp);
		});
	}
});
//on render piece
socket.on('renderPiece', ({ params }) => {
	console.log('params', params);
	boardOponente[params.y][params.x] = params.color;
});
//on score
socket.on('renderScore', ({ score }) => {
	$('#scoreOponente').text(score);
});
socket.on('gameOver', (params) => {
	if (params.score > params.scoreOponente) {
		console.log(':(');
	}
	else {
		console.log('You win');
	}
	$('#scoreOponente').text(score);
});

// on the welcome
socket.on('welcomeGame', ({ message, sala }) => {
	console.log(message);
	hideModal('modalInvitation');
	availableTable('block');
	renderModal('modalTwo', null);
	clearBoard();
	renderTime();
	startTime('time', 5).then(({ state }) => {
		if (state === 'start') {
			hideModal('modalTwo');
			startGame();
		}
		startTime('timing', 120).then(({ state }) => {
			if (state === 'start') {
				$('#timing').text('');
				socket.emit('gameOver', { idSala: salaBoard, score, scoreOponente }, (res) => {
					console.log(res);
				});
			}
		});
	});
});

// socket.on('startGame', () => {
// 	hideModal('modalInvitation');

// 	availableTable('block');
// 	renderModal('modalTwo', null);

// 	clearBoard();
// 	renderTime();
// 	startTime().then(({ state }) => {
// 		if (state === 'start') {
// 			hideModal('modalTwo');
// 		}
// 	});
// });
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

socketEmit = (type, params) => {
	socket.emit(type, params, (resp) => {
		console.log(resp);
	});
};
