var socket = io('https://tetris-multiplayer-real-time.herokuapp.com');

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
	$('#aceptarInvitacion').css('display', 'block');
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
		$('#aceptarInvitacion').css('display', 'none');
		renderModal('modalInvitation', { name: 'textoModal', description: `${nombre} no ha aceptado tu invitacioon` });
	}
	else {
		$(`#${oponenteID}`).text('jugando..');
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
	for (r = 0; r < ROW; r++) {
		let isRowFull = true;
		for (c = 0; c < COL; c++) {
			isRowFull = isRowFull && boardOponente[r][c] != VACANT;
		}
		if (isRowFull) {
			// if the row is full
			// we move down all the rows above it
			for (let y = r; y > 1; y--) {
				for (c = 0; c < COL; c++) {
					boardOponente[y][c] = boardOponente[y - 1][c];
				}
			}
			// the top row boardOponente[0][..] has no row above it
			for (c = 0; c < COL; c++) {
				boardOponente[0][c] = VACANT;
			}
		}
	}
	$('#scoreOponente').text(score);
});
socket.on('gameOver', (params) => {
	let text = {
		name: 'textoModal',
		userID: '',
		oponenteID: '',
		description: 'Game Over.....You Win'
	};
	$(`#${oponenteID}`).text('invitar');
	$('#aceptarInvitacion').css('display', 'none');
	$('#timing').css('display', 'none');
	$('#tablaOponente').css('display', 'none');
	stopGame();

	if (params.score > params.scoreOponente) {
		text.description = 'Game Over.... You Lost :(';
	}

	renderModal('modalInvitation', text);
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
			$('#timing').css('display', 'block');
			hideModal('modalTwo');
			startGame();
		}
		startTime('timing', 240).then(({ state }) => {
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
