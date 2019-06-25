var params = new URLSearchParams(window.location.search);

var nombre = params.get('nombre');
var sala = params.get('sala');
let oponenteID = 0;
// referencias de jQuery
var divUsuarios = $('#divUsuarios');
let modalTwo = $('#bodyModalTwo');
var denegarInvitacion = $('.denegarInvitacion');
var aceptarInvitacion = $('#aceptarInvitacion');
var formEnviar = $('#formEnviar');
var txtMensaje = $('#txtMensaje');
var divChatbox = $('#divChatbox');
var divOponente = $('#tablaOponente');
// Funciones para renderizar usuarios
function renderizarUsuarios(personas) {
	// [{},{},{}]

	console.log(personas);

	var html = '';

	html += '<li>';
	html += '    <a href="javascript:void(0)" class="active"> Friends</a>';
	html += '</li>';

	for (var i = 0; i < personas.length; i++) {
		if (personas[i].nombre !== nombre) {
			html += '<li>';
			html +=
				'    <a data-id="' +
				personas[i].id +
				'" data-nombre="' +
				nombre +
				'"  href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle"> <span>' +
				personas[i].nombre +
				' <small class="text-success" id="' +
				personas[i].id +
				'">Invitar</small></span></a>';
			html += '</li>';
		}
	}

	divUsuarios.html(html);
}

function renderizarMensajes(mensaje, yo) {
	var html = '';
	var fecha = new Date(mensaje.fecha);
	var hora = fecha.getHours() + ':' + fecha.getMinutes();

	var adminClass = 'info';
	if (mensaje.nombre === 'Administrador') {
		adminClass = 'danger';
	}

	if (yo) {
		html += '<li class="reverse">';
		html += '    <div class="chat-content">';
		html += '        <h5>' + mensaje.nombre + '</h5>';
		html += '        <div class="box bg-light-inverse">' + mensaje.mensaje + '</div>';
		html += '    </div>';
		html += '    <div class="chat-img"><img src="assets/images/users/5.jpg" alt="user" /></div>';
		html += '    <div class="chat-time">' + hora + '</div>';
		html += '</li>';
	}
	else {
		html += '<li class="animated fadeIn">';

		if (mensaje.nombre !== 'Administrador') {
			html += '    <div class="chat-img"><img src="assets/images/users/1.jpg" alt="user" /></div>';
		}

		html += '    <div class="chat-content">';
		html += '        <h5>' + mensaje.nombre + '</h5>';
		html += '        <div class="box bg-light-' + adminClass + '">' + mensaje.mensaje + '</div>';
		html += '    </div>';
		html += '    <div class="chat-time">' + hora + '</div>';
		html += '</li>';
	}

	divChatbox.append(html);
}

function renderModal(modal, text) {
	$('#' + modal).modal('show');
	text !== null && $('#' + text.name).text(text.description);
	text !== null && $('#oponenteID').text(text.oponenteID);
	text !== null && $('#userID').text(text.id);
}

function activeLoading() {
	let html = '';
	html = ' <img src="assets/images/icons/loading.gif" width="75" height="75" alt="...">';
	modalTwo.html(html);
}
function renderTime() {
	let html = '';
	html = '<h1 id="time">5</h1>';
	modalTwo.html(html);
}
function startTime(divID, valStart) {
	return new Promise((resolve, reject) => {
		let count = valStart;
		let setTime = window.setInterval(() => {
			if (count === 0) {
				clearInterval(setTime);
				resolve({ state: 'start' });
			}
			else {
				count--;
				$('#' + divID).text(count);
			}
		}, 1000);
	});
}

function hideModal(modal) {
	$('#' + modal).modal('hide');
}
function scrollBottom() {
	// selectors
	var newMessage = divChatbox.children('li:last-child');

	// heights
	var clientHeight = divChatbox.prop('clientHeight');
	var scrollTop = divChatbox.prop('scrollTop');
	var scrollHeight = divChatbox.prop('scrollHeight');
	var newMessageHeight = newMessage.innerHeight();
	var lastMessageHeight = newMessage.prev().innerHeight() || 0;

	if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
		divChatbox.scrollTop(scrollHeight);
	}
}

function availableTable(mode) {
	divOponente.css('display', mode);
}

// Listeners
divUsuarios.on('click', 'a', function() {
	var id = $(this).data('id');
	var nombre = params.get('nombre');
	oponenteID = id;
	if (id) {
		socket.emit('sendInvitation', { nombre, id }, (resp) => {
			console.log('Respuesta', resp);
			stopGame();
		});
		renderModal('modalTwo', null);
		activeLoading();
	}
	else {
		console.log('Error al obtener los params');
	}
});

aceptarInvitacion.on('click', () => {
	let id = $('#oponenteID').text();
	let myID = $('#ID').text();
	salaBoard = id;
	oponenteID = id;
	hideModal('modalInvitation');
	availableTable('block');
	renderModal('modalTwo', null);
	renderTime();
	stopGame();
	$(`#${id}`).text('jugando..');
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
	socket.emit('responseInvitation', { accept: true, id }, (resp) => {
		console.log(resp);
	});
	socket.emit('joinGame', { idSala: id, myID }, (resp) => {
		console.log(resp);
	});
});

denegarInvitacion.on('click', () => {
	let id = $('#oponenteID').text();
	socket.emit('responseInvitation', { accept: false, id }, (resp) => {
		console.log(resp);
	});
});

formEnviar.on('submit', function(e) {
	e.preventDefault();

	if (txtMensaje.val().trim().length === 0) {
		return;
	}

	socket.emit(
		'crearMensaje',
		{
			nombre: nombre,
			mensaje: txtMensaje.val()
		},
		function(mensaje) {
			txtMensaje.val('').focus();
			renderizarMensajes(mensaje, true);
			scrollBottom();
		}
	);
});
