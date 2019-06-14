const cvs = document.getElementById('tetris');
const ctx = cvs.getContext('2d');
const scoreElement = document.getElementById('score');

const ROW = 20;
const COL = (COLUMN = 10);
const SQ = (squareSize = 20);
const VACANT = 'WHITE'; // color of an empty square

// draw a square
function drawSquare(x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

	ctx.strokeStyle = 'BLACK';
	ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// create the boarddsffsdsdfsd

let board = [];
for (r = 0; r < ROW; r++) {
	board[r] = [];
	for (c = 0; c < COL; c++) {
		board[r][c] = VACANT;
	}
}

// draw the board
function drawBoard() {
	for (r = 0; r < ROW; r++) {
		for (c = 0; c < COL; c++) {
			drawSquare(c, r, board[r][c]);
		}
	}
}

drawBoard();

let p = randomPiece();

// CONTROL the piece

document.addEventListener('keydown', CONTROL);

function CONTROL(event) {
	if (event.keyCode == 37) {
		p.moveLeft();
		dropStart = Date.now();
	}
	else if (event.keyCode == 38) {
		p.rotate();
		dropStart = Date.now();
	}
	else if (event.keyCode == 39) {
		p.moveRight();
		dropStart = Date.now();
	}
	else if (event.keyCode == 40) {
		p.moveDown();
	}
}

// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
function drop() {
	let now = Date.now();
	let delta = now - dropStart;
	if (delta > 1000) {
		p.moveDown();
		dropStart = Date.now();
	}
	if (!gameOver) {
		requestAnimationFrame(drop);
	}
}

drop();
