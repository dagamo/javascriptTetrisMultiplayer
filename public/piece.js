// the pieces and their colors
const ROW = 20;
const COL = (COLUMN = 10);
const SQ = (squareSize = 20);
const VACANT = 'WHITE'; // color of an empty square

const PIECES = [
	[ Z, 'red' ],
	[ S, 'green' ],
	[ T, 'yellow' ],
	[ O, 'blue' ],
	[ L, 'purple' ],
	[ I, 'cyan' ],
	[ J, 'orange' ]
];

// generate random pieces
function randomPiece() {
	let r = (randomN = Math.floor(Math.random() * PIECES.length)); // 0 -> 6
	return new Piece(PIECES[r][0], PIECES[r][1]);
}
//lock the piece
function stopGame() {
	gameOver = true;
	clearBoard();
	drawBoard();
}
function startGame() {
	gameOver = false;
	clearBoard();
	drawBoard();
	p = randomPiece();
	drop();
}

class Piece {
	constructor(tetromino, color) {
		this.tetromino = tetromino;
		this.color = color;

		this.tetrominoN = 0; // we start from the first pattern
		this.activeTetromino = this.tetromino[this.tetrominoN];

		// we need to control the pieces
		this.x = 3;
		this.y = -2;
	}

	fill(color) {
		for (r = 0; r < this.activeTetromino.length; r++) {
			for (c = 0; c < this.activeTetromino.length; c++) {
				// we draw only occupied squares
				if (this.activeTetromino[r][c]) {
					drawSquare(this.x + c, this.y + r, color);
				}
			}
		}
	}

	// draw a piece to the board

	draw() {
		this.fill(this.color);
	}

	// undraw a piece

	unDraw() {
		this.fill(VACANT);
	}

	// move Down the piece

	moveDown() {
		if (!this.collision(0, 1, this.activeTetromino) && !gameOver) {
			this.unDraw();
			this.y++;
			this.draw();
		}
		else {
			// we lock the piece and generate a new one
			this.lock();
			p = randomPiece();
		}
	}

	// move Right the piece
	moveRight() {
		if (!this.collision(1, 0, this.activeTetromino)) {
			this.unDraw();
			this.x++;
			this.draw();
		}
	}

	// move Left the piece
	moveLeft() {
		if (!this.collision(-1, 0, this.activeTetromino)) {
			this.unDraw();
			this.x--;
			this.draw();
		}
	}

	// rotate the piece
	rotate() {
		let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
		let kick = 0;

		if (this.collision(0, 0, nextPattern)) {
			if (this.x > COL / 2) {
				// it's the right wall
				kick = -1; // we need to move the piece to the left
			}
			else {
				// it's the left wall
				kick = 1; // we need to move the piece to the right
			}
		}

		if (!this.collision(kick, 0, nextPattern)) {
			this.unDraw();
			this.x += kick;
			this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0+1)%4 => 1
			this.activeTetromino = this.tetromino[this.tetrominoN];
			this.draw();
		}
	}

	lock() {
		for (r = 0; r < this.activeTetromino.length; r++) {
			for (c = 0; c < this.activeTetromino.length; c++) {
				// we skip the vacant squares
				if (!this.activeTetromino[r][c]) {
					continue;
				}
				// pieces to lock on top = game over
				if (this.y + r < 0) {
					if (salaBoard) {
						socket.emit('gameOver', { idSala: salaBoard, score, scoreOponente }, (res) => {
							console.log(res);
						});
					}
					else {
						let text = {
							name: 'textoModal',
							userID: '',
							oponenteID: '',
							description: `Game over => Score: ${score}`
						};
						$('#aceptarInvitacion').css('display', 'none');
						stopGame();
						renderModal('modalInvitation', text);
					}
					// stop request animation frame
					gameOver = true;
					return false;
				}
				// we lock the piece
				board[this.y + r][this.x + c] = this.color;
				if (salaBoard) {
					socket.emit(
						'sendPiece',
						{ idSala: salaBoard, y: [ this.y + r ], x: [ this.x + c ], color: this.color },
						(res) => {
							console.log(res);
						}
					);
				}
			}
		}
		// remove full rows
		for (r = 0; r < ROW; r++) {
			let isRowFull = true;
			for (c = 0; c < COL; c++) {
				isRowFull = isRowFull && board[r][c] != VACANT;
			}
			if (isRowFull) {
				// if the row is full
				// we move down all the rows above it
				for (let y = r; y > 1; y--) {
					for (c = 0; c < COL; c++) {
						board[y][c] = board[y - 1][c];
					}
				}
				// the top row board[0][..] has no row above it
				for (c = 0; c < COL; c++) {
					board[0][c] = VACANT;
				}
				// increment the score
				score += 10;
				if (salaBoard) {
					socket.emit('aumentedScore', { idSala: salaBoard, score }, (res) => {
						console.log(res);
					});
				}
			}
		}
		// update the board
		drawBoard();

		// update the score
		scoreElement.innerHTML = score;
	}

	// collision fucntion

	collision(x, y, piece) {
		for (r = 0; r < piece.length; r++) {
			for (c = 0; c < piece.length; c++) {
				// if the square is empty, we skip it
				if (!piece[r][c]) {
					continue;
				}
				// coordinates of the piece after movement
				let newX = this.x + c + x;
				let newY = this.y + r + y;

				// conditions
				if (newX < 0 || newX >= COL || newY >= ROW) {
					return true;
				}
				// skip newY < 0; board[-1] will crush our game
				if (newY < 0) {
					continue;
				}
				// check if there is a locked piece alrady in place
				if (board[newY][newX] != VACANT) {
					return true;
				}
			}
		}
		return false;
	}
}
